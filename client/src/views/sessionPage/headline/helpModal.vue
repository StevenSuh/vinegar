<template>
  <div class="help-wrapper">
    <img
      class="help-icon hover"
      :src="HelpIcon"
      alt="help modal"
      @click="onClickHelp"
    />
    <Modal
      :on-close="onClose"
      :on-esc="onClose"
      :open="isOpen"
    >
      <div class="help-modal">
        <span
          class="close-button hover"
          @click="onClose"
          v-html="RemoveIcon"
        />
        <div class="how-wrapper">
          <div class="how-item paddingBottom">
            <p class="how-works">
              How this works:
            </p>
            <div class="step-wrapper marginTop marginBottom">
              <img
                class="step-img"
                :src="StepOneImg"
                alt="step 1"
              />
              <p class="step-msg">
                Timer will starts once begins and everyone joins.
              </p>
            </div>
            <div class="step-wrapper marginBottom">
              <img
                class="step-img"
                :src="StepTwoImg"
                alt="step 2"
              />
              <p class="step-msg">
                Only begin taking notes if it's your turn! You will also be
                notified through email and/or phone.
              </p>
            </div>
            <div class="step-wrapper">
              <img
                class="step-img"
                :src="StepThreeImg"
                alt="step 3"
              />
              <p class="step-msg">
                Meanwhile, enjoy your class time...by doing anything else you'd
                like!
              </p>
            </div>
          </div>
          <img
            class="snoo-help"
            :src="isOwner ? SnooOwnerImg : SnooImg"
            alt="snoo"
          />
        </div>
        <div
          v-if="isOwner"
          class="instruction-wrapper"
        >
          <p class="instruction-header">
            {{ 'Looks like you are the ' }} <span class="bold"> owner </span>
            {{ ' of ' }}
            <span class="bold">
              {{ `${$route.params.school}/${$route.params.session}!` }}
            </span>
          </p>
          <p>Here's what you can do:</p>
          <div class="instruction-item item-paddingTop">
            <input-component
              class="participants-input"
              :disabled="true"
              placeholder="# of participants"
              size="x-small"
            />
            <img
              class="back-img"
              :src="BackImage"
              alt="point left"
            />
            <p class="instruction-text">
              <span>{{ 'Set the minimum number of ' }}</span>
              <span class="instruction-highlight"> participants </span>
              <span>{{ ' you want in order to initiate the session.' }}</span>
            </p>
          </div>
          <div class="instruction-item item-paddingBottom">
            <div class="people-wrapper">
              <div class="people-item first-item">
                <p class="person-name">
                  Toby Flenderson
                </p>
                <span
                  class="person-remove marginLeft"
                  v-html="RemoveIcon"
                />
              </div>
              <div class="people-item">
                <p class="person-name">
                  Kevin Malone
                </p>
                <span
                  class="person-remove marginLeft"
                  v-html="RemoveIcon"
                />
              </div>
            </div>
            <img
              class="back-img"
              :src="BackImage"
              alt="point left"
            />
            <p class="instruction-text">
              <span>{{ 'Remove anyone in your session. After ' }}</span>
              <span class="instruction-highlight"> three </span>
              <span>
                {{
                  ' times, they will be permanently kicked from the session.'
                }}
              </span>
            </p>
          </div>
        </div>
        <div class="feedback-wrapper marginTop small">
          <form
            class="form-wrapper"
            @submit="onSubmitFeedback"
          >
            <p class="feedback-title">
              Send Us Feedback
            </p>
            <textarea
              id="feedback"
              ref="feedback"
              class="feedback-box"
              rows="5"
              placeholder="Describe your issue or idea..."
              type="text"
              :value="feedbackValue"
              @input="onFeedbackChange"
            />
            <button-component
              :has-form="true"
              size="small"
              type="primary"
            >
              <p class="send-msg">
                Send
              </p>
            </button-component>
          </form>
          <div class="icon-defs-wrapper marginBottom small">
            <div class="icon-owner">
              <span
                class="owner-icon"
                v-html="OwnerIcon"
              />
              <span>= Session Owner</span>
            </div>
            <div class="icon-interval marginTop small">
              <span v-html="IntervalIcon" /> <span>= Current Editor</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import { socketMixin } from '@/services/socket';
import { submitFeedback } from '@/services/api';

import ButtonComponent from '@/components/button';
import InputComponent from '@/components/input';
import Modal from '@/components/modal';

import OwnerIcon from '!raw-loader!@/assets/owner.svg';
import IntervalIcon from '!raw-loader!@/assets/interval.svg';
import RemoveIcon from '!raw-loader!@/assets/x.svg';
import BackImage from '@/assets/back.png';
import HelpIcon from '@/assets/help.png';
import SnooImg from '@/assets/snoop-peace.png';
import SnooOwnerImg from '@/assets/snoop-peace-owner.png';
import StepOneImg from '@/assets/step1.png';
import StepTwoImg from '@/assets/step2.png';
import StepThreeImg from '@/assets/step3.png';

export default {
  components: {
    ButtonComponent,
    InputComponent,
    Modal,
  },
  mixins: [socketMixin],
  props: {
    socket: [Object, WebSocket],
  },
  data() {
    return {
      feedbackValue: '',
      isOpen: false,
      isOwner: null,

      BackImage,
      OwnerIcon,
      RemoveIcon,
      IntervalIcon,
      HelpIcon,
      SnooImg,
      SnooOwnerImg,
      StepOneImg,
      StepTwoImg,
      StepThreeImg,
    };
  },
  methods: {
    onClickHelp() {
      this.isOpen = true;
    },
    onClose() {
      this.isOpen = false;
    },
    onFeedbackChange(e) {
      const { value } = e.target;
      this.feedbackValue = value;
    },
    onSubmitFeedback(e) {
      e.preventDefault();
      submitFeedback(this.feedbackValue);
      this.feedbackValue = '';
    },
  },
  sockets: {
    'people:onEnter': function({ isOwner }) {
      this.isOwner = isOwner;
    },
  },
};
</script>

<style scoped>
.help-wrapper {
  height: 50px;
  width: 50px;
}

.help-icon {
  cursor: pointer;
  object-fit: contain;
  height: 50px;
  width: 50px;
}

.help-modal {
  padding: 30px 35px;
  min-width: 700px;
  width: 40vw;
}

@media (max-width: 700px) {
  .help-modal {
    min-width: unset;
    padding: 20px;
    width: 100vw;
  }
}

.close-button {
  cursor: pointer;
  height: 25px;
  position: absolute;
  right: 15px;
  top: 15px;
  width: 25px;
}

.how-item {
  flex: 1;
}

.how-works {
  font-size: 18px;
  margin-bottom: 10px;
}

.how-wrapper {
  align-items: flex-end;
  display: flex;
}

.snoo-help {
  object-fit: contain;
  width: 160px;
}

.step-wrapper {
  align-content: center;
  display: flex;
  flex-direction: row;
}

.step-wrapper.marginBottom {
  margin-bottom: 10px;
}

.step-wrapper.marginTop {
  margin-top: 5px;
}

.step-img {
  height: 50px;
  width: 50px;
}

.step-msg {
  display: inline-block;
  font-size: 14px;
  left: 50px;
  line-height: 1.5em;
  margin: auto;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: calc(100% - 50px);
}

.instruction-wrapper::before {
  content: '';
  border-radius: 8px;
  width: calc(100% + 30px);
  height: calc(100% + 20px);
  position: absolute;
  top: -15px;
  left: -15px;
  background-color: var(--gray-bg-color-hover);
}

.instruction-header {
  font-size: 18px;
  margin-bottom: 10px;
}

.instruction-item {
  align-items: center;
  display: flex;
  padding: 10px 20px;
  width: 100%;
}

.item-paddingTop {
  padding-top: 20px;
}

.item-paddingBottom {
  padding-bottom: 20px;
}

.instruction-text {
  font-size: 15px;
  line-height: 1.3em;
}

.instruction-highlight {
  color: var(--main-font-color);
}

.first-item {
  margin-bottom: 10px;
}

.back-img {
  margin: 0 8px;
  height: 50px;
  width: 50px;
}

.participants-input {
  min-width: 124px;
  width: 124px;
}

.participants-input::before,
.people-wrapper::before {
  content: '';
  width: calc(100% + 20px);
  border-radius: 6px;
  height: calc(100% + 20px);
  position: absolute;
  top: -10px;
  left: -10px;
  background-color: var(--white-bg-color);
}

.people-item {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.person-name {
  display: inline-block;
  width: max-content;
}

.person-remove {
  height: 18px;
  width: 18px;
}

.bold {
  font-weight: 500;
}

.feedback-wrapper {
  align-items: center;
  display: flex;
}

.form-wrapper {
  text-align: center;
  width: 66.67%;
}

.feedback-title {
  margin-bottom: 14px;
}

.feedback-box {
  border: 1px solid var(--gray-bg-color-2);
  border-radius: 8px;
  font-size: 14px;
  padding: 15px;
  resize: none;
  width: 100%;
}

.feedback-box::placeholder {
  color: var(--gray-font-color);
  font-weight: 300;
}

.send-msg {
  margin-top: 15px;
  padding: 8px 25px !important;
}

.icon-defs-wrapper {
  width: 33.33%;
}

.icon-owner,
.icon-interval {
  align-items: center;
  display: flex;
  font-size: 15px;
  justify-content: center;
}

.owner-icon {
  margin: 0 10px;
}
</style>
