<template>
  <div class="wrapper">
    <div class="people">
      <div
        v-for="person in people"
        :key="person.userId"
        class="person"
      >
        <span
          v-if="!person.isOwner && isInterval"
          class="person-icon interval"
          v-html="IntervalIcon"
        />
        <span
          v-else-if="person.isOwner"
          class="person-icon"
          v-html="OwnerIcon"
        />
        <p
          class="person-name"
          :class="{ bold: isInterval }"
        >
          {{ person.name }}
        </p>
        <span
          v-if="isOwner"
          class="person-remove"
          @click="onRemove(person.userId);"
          v-html="RemoveIcon"
        />
      </div>
    </div>
    <p
      v-if="status === 'waiting' && participants > people.length"
      class="waiting-msg marginBottom"
    >
      {{ 'Waiting for ' }}
      <span class="bold">
        {{ participants - people.length }}
      </span>
      {{ ' more people to begin session...' }}
    </p>
  </div>
</template>

<script>
import { socketMixin } from '@/services/socket';

import OwnerIcon from '!raw-loader!@/assets/owner.svg';
import IntervalIcon from '!raw-loader!@/assets/interval.svg';
import RemoveIcon from '!raw-loader!@/assets/x.svg';

// import DeleteModal from './delete';

export default {
  components: {
    // DeleteModal,
  },
  mixins: [socketMixin],
  props: {
    socket: [Object, WebSocket],
  },
  data() {
    return {
      // state
      isOwner: null,
      isInterval: null,
      participants: null,
      people: [],
      status: null,

      // asset
      RemoveIcon,
      OwnerIcon,
      IntervalIcon,
    };
  },
  methods: {
    onRemove(/* userId */) {
      // should pop up a modal
      // console.log(userId);
    },
  },
  sockets: {
    'control:onUpdateStatus': function({ participants, status }) {
      this.participants = participants;
      this.status = status;
    },
    'people:onEnter': function({ isOwner, participants, people, status }) {
      this.isOwner = isOwner;
      this.participants = participants;
      this.people = people;
      this.status = status;
    },
    'people:onJoin': function(person) {
      if (!person.isOwner) {
        this.people.push(person);
        return;
      }
      this.people.splice(0, 0, person);
    },
    'people:onLeave': function({ userId }) {
      const personIndex = this.people.findIndex(person => person.id === userId);

      if (personIndex === this.people.length - 1) {
        this.people.pop();
      } else {
        this.people.splice(personIndex, 1);
      }
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.waiting-msg {
  text-align: center;
}

.people {
  align-content: flex-start;
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  font-size: 16px;
  overflow-x: auto;
}

.person {
  align-items: center;
  display: flex;
  margin: 8px 0;
  padding-left: 40px;
  width: 33.33%;
}

.person:hover > .person-remove {
  opacity: 1;
}

.person-icon {
  height: 25px;
  position: absolute;
  left: 0;
  width: 25px;
}

.person-name {
  line-height: 23px;
  overflow: hidden;
  margin-right: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.bold {
  font-weight: 500;
}

.person-remove {
  cursor: pointer;
  height: 18px;
  opacity: 0;
  transition: opacity var(--transition-short-duration) var(--transition-curve);
  width: 18px;
}

.person-remove:hover {
  opacity: 0.5 !important;
}

/* @media (max-width: 1200px) {
  .person {
    width: 50%;
  }
} */
</style>

<style>
.person-remove > svg {
  height: 18px;
  top: -1px;
  width: 18px;
}

.interval > svg {
  height: 39px;
  left: -5px;
  pointer-events: none;
  top: -6px;
  width: 39px;
}
</style>
