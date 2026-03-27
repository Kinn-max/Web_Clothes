import type { Firestore } from "firebase/firestore";
import type { Auth } from "firebase/auth";

declare module "#app" {
  interface NuxtApp {
    $db: Firestore;
    $auth: Auth;
  }
}