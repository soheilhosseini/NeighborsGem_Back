import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "./nesgem-1659d-firebase-adminsdk-fbsvc-c0693bbb47.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});
