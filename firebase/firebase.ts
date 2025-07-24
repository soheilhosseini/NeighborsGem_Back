import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from "./nesgem-1659d-firebase-adminsdk-fbsvc-b72dadc7ab.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});
