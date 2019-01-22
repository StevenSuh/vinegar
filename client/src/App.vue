<template>
  <div id="app"><router-view /></div>
</template>

<script>
export default {
  name: 'app',
};
</script>

<style>
:root {
  /*
  reference

  @custom-media --xx-small-viewport only screen and (max-width: 320px);
  @custom-media --x-small-viewport only screen and (max-width: 416px);
  @custom-media --small-viewport only screen and (min-width: 416px) and (max-width: 580px);
  @custom-media --medium-viewport only screen and (min-width: 580px) and (max-width: 864px);
  @custom-media --large-viewport only screen and (min-width: 864px) and (max-width: 1096px);
  @custom-media --x-large-viewport only screen and (min-width: 1096px);
  @custom-media --phone (--x-small-viewport), (--small-viewport);
  @custom-media --desktop (--large-viewport), (--x-large-viewport);
  */

  --main-bg-color: #f88379;
  --main-bg-color-hover: #ee7d74;
  --gray-bg-color-2: #CBD0D6;
  --gray-bg-color: #f7f7f7;
  --gray-bg-color-hover: #f5f5f5;
  --white-bg-color: #ffffff;

  --main-font-color: #f88379;
  --main-font-color-hover: #ee7d74;
  --main-font-color-light: #FEF3F2;
  --gray-font-color: #bac1c9;
  --black-font-color: #444444;
  --white-font-color: #ffffff;

  --transition-curve: cubic-bezier(0.8, 0, 0.2, 1);
  --transition-duration: 0.2s;
}

body,
html,
#app {
  color: var(--black-font-color);
  width: 100%;
}

body,
button,
h1,
h2,
h3,
h4,
h5,
h6,
html,
p {
  margin: 0;
  padding: 0;
}

a {
  color: inherit;
  display: inline-block;
  text-decoration: none;
}

button {
  background-color: transparent;
}

a,
button,
input,
a:focus,
button:focus,
input:focus {
  border: none;
  outline: 0;
}

* {
  font-family: 'Rubik', Helvetica, Arial, sans-serif;
  box-sizing: border-box;
  position: relative;
}

/* animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-duration) var(--transition-curve);
}

.fade-enter-active {
  transition-delay: var(--transition-duration);
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* reusable global classes */
.container {
  margin: auto;
  width: 80%;
}

@media (max-width: 416px) {
  .container {
    width: 90%;
  }
}

.hover {
  transition: opacity var(--transition-duration) var(--transition-curve);
}

.hover:hover {
  opacity: 0.5;
}

/* margin */
.marginTop {
  margin-top: 40px;
}

.marginTop.small {
  margin-top: 20px;
}

.marginTop.large {
  margin-top: 60px;
}

.marginBottom {
  margin-bottom: 40px;
}

.marginBottom.small {
  margin-bottom: 20px;
}

.marginBottom.large {
  margin-bottom: 60px;
}

.marginRight {
  margin-right: 40px;
}

.marginRight.small {
  margin-right: 20px;
}

.marginRight.large {
  margin-right: 60px;
}

.marginLeft {
  margin-left: 40px;
}

.marginLeft.small {
  margin-left: 20px;
}

.marginLeft.large {
  margin-left: 60px;
}

/* padding */
.paddingTop {
  padding-top: 40px;
}

.paddingTop.small {
  padding-top: 20px;
}

.paddingTop.large {
  padding-top: 60px;
}

.paddingBottom {
  padding-bottom: 40px;
}

.paddingBottom.small {
  padding-bottom: 20px;
}

.paddingBottom.large {
  padding-bottom: 60px;
}

.paddingRight {
  padding-right: 40px;
}

.paddingRight.small {
  padding-right: 20px;
}

.paddingRight.large {
  padding-right: 60px;
}

.paddingLeft {
  padding-left: 40px;
}

.paddingLeft.small {
  padding-left: 20px;
}

.paddingLeft.large {
  padding-left: 60px;
}
</style>
