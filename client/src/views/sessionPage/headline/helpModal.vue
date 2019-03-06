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
                Only begin taking notes if it's your turn! You will also be notified
                through email and/or phone.
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
      </div>
    </Modal>
  </div>
</template>

<script>
import { socketMixin } from '@/services/socket';

import Modal from '@/components/modal';

import HelpIcon from '@/assets/help.png';
import SnooImg from '@/assets/snoop-peace.png';
import SnooOwnerImg from '@/assets/snoop-peace-owner.png';
import StepOneImg from '@/assets/step1.png';
import StepTwoImg from '@/assets/step2.png';
import StepThreeImg from '@/assets/step3.png';

export default {
  components: {
    Modal,
  },
  data() {
    return {
      isOpen: false,
      isOwner: null,
      HelpIcon,
      SnooImg,
      SnooOwnerImg,
      StepOneImg,
      StepTwoImg,
      StepThreeImg,
    };
  },
  mixins: [socketMixin],
  props: {
    socket: [Object, WebSocket],
  },
  methods: {
    onClickHelp() {
      this.isOpen = true;
    },
    onClose() {
      this.isOpen = false;
    },
  },
  sockets: {
    'people:onEnter': function({ isOwner }) {
      this.isOwner = isOwner;
    },
  },
}
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
  position: relative !important;
  min-width: 700px;
  width: 40vw;
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
</style>
