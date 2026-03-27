import { defineNuxtPlugin } from "nuxt/app";
import { createPinia } from "pinia";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(createPinia());
});
