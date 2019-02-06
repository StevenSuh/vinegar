<template>
  <div>
    <span class="ql-formats">
      <button class="ql-bold" /> <button class="ql-italic" />
      <button class="ql-underline" /> <button class="ql-strike" />
      <button class="ql-code" />
    </span>
    <span class="ql-formats">
      <button
        class="ql-smallerFont"
        v-html="SizeDecIcon"
      />
      <button
        class="ql-largerFont"
        v-html="SizeIncIcon"
      />
    </span>
    <span class="ql-formats">
      <button
        class="ql-list"
        value="ordered"
      />
      <button
        class="ql-list"
        value="bullet"
      />
    </span>
    <span class="ql-formats">
      <button
        class="ql-align ql-active"
        value
      />
      <button
        class="ql-align"
        value="center"
      />
      <button
        class="ql-align"
        value="right"
      />
    </span>
    <span class="ql-formats">
      <button
        class="ql-indent"
        value="-1"
      />
      <button
        class="ql-indent"
        value="+1"
      />
    </span>
    <span class="ql-formats">
      <button class="ql-blockquote" /> <button class="ql-code-block" />
    </span>
    <span class="ql-formats">
      <button
        class="ql-direction"
        value="rtl"
      />
    </span>
    <span class="ql-formats">
      <select class="ql-color" />
      <select class="ql-background" />
    </span>
    <span class="ql-formats">
      <button
        class="ql-script"
        value="sub"
      />
      <button
        class="ql-script"
        value="super"
      />
    </span>
    <span class="ql-formats">
      <button class="ql-clean" />
    </span>
    <span class="ql-formats">
      <button
        class="ql-undo"
        v-html="UndoIcon"
      />
      <button
        class="ql-redo"
        v-html="RedoIcon"
      />
    </span>
  </div>
</template>

<script>
import SizeDecIcon from '!raw-loader!quill/assets/icons/size-decrease.svg';
import SizeIncIcon from '!raw-loader!quill/assets/icons/size-increase.svg';
import RedoIcon from '!raw-loader!quill/assets/icons/redo.svg';
import UndoIcon from '!raw-loader!quill/assets/icons/undo.svg';

export default {
  data() {
    return {
      SizeDecIcon,
      SizeIncIcon,
      RedoIcon,
      UndoIcon,
    };
  },
};
</script>

<style>
.ql-smaller > svg,
.ql-larger > svg {
  transform: scaleX(1.1) scaleY(0.95);
}
</style>
