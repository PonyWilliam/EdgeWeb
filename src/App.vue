<template>
  <BaseHeader />
  <div style="display: flex">
    <BaseSide />
    <div>
      <router-view></router-view>
    </div>
  </div>
</template>

<style>
#app {
  text-align: center;
}

.element-plus-logo {
  width: 50%;
}
a{
  text-decoration: none;
}
.router-link-active{
  text-decoration: none;
}
</style>
