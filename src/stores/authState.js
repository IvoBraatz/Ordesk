import { reactive } from "vue";

export const authState = reactive({
  isAuthenticated: !!localStorage.getItem("authToken"),
  isAdmin: false,
  currentUser: localStorage.getItem("currentUser")
    ? JSON.parse(localStorage.getItem("currentUser"))
    : null,
});

export function setAuthenticated(status, adminStatus = false, currentUser = null) {
  authState.isAuthenticated = status;
  authState.isAdmin = adminStatus;
  authState.currentUser = currentUser;
  if (currentUser) {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  } else {
    localStorage.removeItem("currentUser");
  }
}
