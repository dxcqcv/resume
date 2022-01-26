declare var require: any;

require("../css/index.styl");

/**
 * download pdf
 * todo check require from node_modules
 */
// const html2canvas = require("./html2canvas.min.js");
// const { jsPDF } = require("./jspdf.umd.min.js");

// const download = document.querySelector("#download-pdf");

// download.addEventListener("click", () => {
//   html2canvas(document.querySelector(".container"), { scale: 6 }).then(
//     (canvas) => {
//       console.log(canvas);
//       let pdf = new jsPDF("p", "mm", "a4");

//       const image_height = (211 / canvas.width) * canvas.height;
//       pdf.addImage(
//         canvas.toDataURL("image/png"),
//         "PNG",
//         0,
//         0,
//         211,
//         image_height,
//         "FAST"
//       );
//       pdf.save("test");
//     }
//   );
// });
