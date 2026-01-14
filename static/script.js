// Get the input box and all buttons
let input = document.getElementById("inputBox");
let buttons = document.querySelectorAll("button");

let string = "";
let arr = Array.from(buttons);

arr.forEach(button => {
  button.addEventListener("click", (e) => {
    const value = e.target.innerHTML;

    if (value === "=") {
      try {
        string = eval(string); // Calculate result
        input.value = string;
      } catch (error) {
        input.value = "Error";
        string = "";
      }
    } else if (value === "AC") {
      string = "";
      input.value = string;
    } else if (value === "DEL") {
      string = string.slice(0, -1); // Remove last character
      input.value = string;
    } else {
      string += value;
      input.value = string;
    }
  });
});
