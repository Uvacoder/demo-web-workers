import { full_res_uploads } from "./upload.js";

const downloads_pane = document.getElementById("downloadsPane");
const grayscale_button = document.getElementById("convertToGrayscale");
grayscale_button.addEventListener("click", convertImages);

/** 1. Converts the uploaded image thumbnails to greyscale
 * 2. Renders the converted results in the preview pane */
export default function convertImages() {
  const upload_canvases = document.getElementsByClassName("image");
  Array.from(upload_canvases).forEach((canvas, i) => {
    const context = canvas.getContext("2d");
    console.time("ctx.getImageData");
    let px = context.getImageData(0, 0, canvas.width, canvas.height);
    console.timeEnd("ctx.getImageData");

    console.time("toGrayscale");
    toGrayscale(px);
    console.timeEnd("toGrayscale");

    const new_canvas = canvas.cloneNode(true);
    const new_canvas_context = new_canvas.getContext("2d");

    console.time("ctx.putImageData");
    new_canvas_context.putImageData(px, 0, 0, 0, 0, px.width, px.height);
    console.timeEnd("ctx.putImageData");

    console.time("canvas.toDataURL");
    const new_src = new_canvas.toDataURL();
    console.timeEnd("canvas.toDataURL");

    const thumbnail_img = new Image();
    thumbnail_img.width = canvas.width;
    thumbnail_img.height = canvas.height;
    thumbnail_img.src = new_src;
    thumbnail_img.onload = () => {
      new_canvas.width = canvas.width;
      new_canvas.height = canvas.height;
      new_canvas_context.drawImage(thumbnail_img, 0, 0);
      new_canvas.classList.add("converted");

      const img_container = document.createElement("div");
      img_container.classList.add("convertedImageContainer");
      const download_link = document.createElement("a");
      download_link.textContent = "Download";
      download_link.download = `$img${i}_grayscale.jpg`;
      download_link.classList.add("disabled");
      download_link.id = `downloadLink${i}`;
      img_container.appendChild(new_canvas);
      img_container.appendChild(download_link);
      downloads_pane.appendChild(img_container);
    };
    thumbnail_img.onerror = () =>
      console.error("The provided file couldn't be loaded as an image");
  });

  // Converts each full res image to grayscale by creating an offscreen canvas
  full_res_uploads.forEach((canvas, i) => {
    const context = canvas.getContext("2d");
    let px = context.getImageData(0, 0, canvas.width, canvas.height);

    console.time("toGrayscale");
    toGrayscale(px);
    console.timeEnd("toGrayscale");

    const new_canvas = new OffscreenCanvas(px.width, px.height);
    const new_context = new_canvas.getContext("2d");
    new_context.putImageData(px, 0, 0, 0, 0, px.width, px.height);

    // Generate a download URL for the full res converted image
    new_canvas.convertToBlob().then((blob) => {
      const download_url = URL.createObjectURL(blob);
      const download_link = document.getElementById(`downloadLink${i}`);
      download_link.href = download_url;
      download_link.classList.remove("disabled");
    });
  });
}

/** Mutates an array of rgba pixel values in place to grayscale */
function toGrayscale(px) {
  for (let y = 0; y < px.height; y++) {
    for (let x = 0; x < px.width; x++) {
      const r_index = y * (4 * px.width) + x * 4;
      const g_index = r_index + 1;
      const b_index = g_index + 1;
      const avg = (px.data[r_index] + px.data[g_index] + px.data[b_index]) / 3;
      px.data[r_index] = avg;
      px.data[g_index] = avg;
      px.data[b_index] = avg;
    }
  }
}
