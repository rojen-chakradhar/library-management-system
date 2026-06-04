counter = 1;
function hamMenu() {
	aside = document.querySelector("aside");
	hideElm = document.querySelectorAll(".hide");
	hamburgerMenu = document.querySelector("#hamMenu");
	if (counter == 1) {
		aside.style.width = "60px";
		hideElm.forEach((elm) => {
			elm.style.display = "none";
		});
		counter = 2;
	} else if (counter == 2) {
		aside.style.width = "20%";
		hideElm.forEach((elm) => {
			elm.style.display = "inline-block";
		});
		counter = 1;
	}
}
