// show caution or success message (which is under the header)
// requires path is either /user/signup or /user/signin
const msgTable = document.getElementById("message-table");

export const hideMessage = () => {
  msgTable.style.visibility = "hidden";
};

export const showMessage = (error, msg) => {
  const output = document.getElementById("message");
  const msgImage = document.getElementById("message-image");

  if (error) {
    msgImage.src = "images/error.png";
  } else {
    msgImage.src = "images/check.png";
  }
  output.textContent = msg;
  msgTable.style.visibility = "visible";
};

export const getToken = (path, data) => {
  const shorten = (str) => {
    const idx = str.indexOf('"');
    if (idx === -1) {
      return str;
    } else {
      return str.substring(0, idx).concat(shorten(str.substring(idx + 1)));
    }
  };

  const postOption = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  fetch(path, postOption)
    .then((res) => res.json())
    .then((data) => {
      const { error } = data;
      if (error) {
        showMessage(true, shorten(error));
      } else {
        showMessage(false, "Success. You will be redirected shortly");
        let redirect = "/signin";
        if (path === "/user/signin") {
          sessionStorage.setItem("signed", true);
          redirect = "/";
        }
        setTimeout(() => (window.location.href = redirect), 1500);
      }
    })
    .catch((err) => console.log(err));
};