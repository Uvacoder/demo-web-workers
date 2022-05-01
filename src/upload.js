export const full_res_uploads = [];

const uploads_input = document.getElementById("imageUpload");
const uploads_pane = document.getElementById("uploadsPane");

uploads_pane.ondragenter = (e) => e.preventDefault();

uploads_pane.ondragover = (e) => {
  uploads_pane.classList.add("ondragover");
  e.preventDefault();
};

uploads_pane.ondragleave = () => uploads_pane.classList.remove("ondragover");

// Handle file drops in the upload box area
uploads_pane.ondrop = (e) => {
  uploads_pane.classList.remove("ondragover");
  e.preventDefault();

  if (e.dataTransfer.files.length) {
    uploads_input.files = e.dataTransfer.files;
    uploads_input.dispatchEvent(new Event("change"));
  }
};

// Event listener for the image upload box - fires on the 'drop' event
uploads_input.onchange = (e) => handleUploads(e.target.files);

uploads_pane.onclick = (e) => {
  console.log("uploads_pane clicked");
  uploads_input.onclick.apply(uploads_input);
};
// uploads_input.onclick = (e) => console.log("clicked");

/** For each image being uploaded:
 * 1. Stores the full res image data in an offscreen canvas
 * 2. Renders a low res version on screen in a thumbnail canvas */
export function handleUploads(files) {
  for (let i = 0; i < files.length; i++) {
    const img = new Image();
    img.src = URL.createObjectURL(files[i]);
    img.onload = () => {
      // Store the full res uploaded image data in an offscreen canvas
      createImageBitmap(img).then((bitmap) => {
        const offscreen_canvas = new OffscreenCanvas(img.width, img.height);
        const offscreen_ctx = offscreen_canvas.getContext("2d");
        offscreen_ctx.drawImage(bitmap, 0, 0);
        full_res_uploads.push(offscreen_canvas);
      });

      // Add thumbnails for the uploaded images to DOM
      const thumbnail_canvas = document.createElement("canvas");
      const thumbnail_ctx = thumbnail_canvas.getContext("2d");

      thumbnail_canvas.width = 150;
      thumbnail_canvas.height = 75;
      thumbnail_ctx.drawImage(
        img,
        0,
        0,
        thumbnail_canvas.width,
        thumbnail_canvas.width
      );
      thumbnail_canvas.classList.add("image");
      const img_container = document.createElement("div");
      img_container.classList.add("uploadedImageContainer");
      const og_resolution_descriptor = document.createElement("span");
      og_resolution_descriptor.textContent = `${img.width} x ${img.height}`;
      img_container.appendChild(thumbnail_canvas);
      img_container.appendChild(og_resolution_descriptor);
      uploads_pane.appendChild(img_container);
      uploads_pane.classList.remove("empty");
    };
    img.onerror = () =>
      console.error("The provided file couldn't be loaded as an image");
  }
}
