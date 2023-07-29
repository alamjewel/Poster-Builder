/**
 * short form of document.selector
 * 
 * @param {String} selector html element
 * @return {Object | null} first element within the document. If not, null is returned.
 */
const selector = (selector) => document.querySelector(selector);

// Toggle buttons
const buttons = {
    heading: selector("#headingBtn"),
    image: selector("#imageBtn"),
    description: selector("#descriptionBtn"),
};

// Component sections
const sections = {
    heading: selector("#headingSection"),
    image: selector("#imageSection"),
    description: selector("#descriptionSection"),
};

// Input sections
const inputs = {
    heading: selector("#headingInput"),
    image: selector("#imageInput"),
    description: selector("#descriptionInput"),
};

// Preview sections
const previews = {
    heading: selector("#headingPreview"),
    image: selector("#imagePreview"),
    description: selector("#descriptionPreview"),
};

/**
 * Show/Hide the section
 *
 * @param {String} element node name.
 * @return {Void } 
 */
const toggleView = (element) => {
    sections[element].classList.toggle("hidden");
    buttons[element].classList.toggle("hidden");
    previews[element].classList.toggle("hidden");
};

// loop through the inputs, for tracking & apply the changes
for (const input in inputs) {
    if (input === "image") {
        // Preview the image, after the file selection
        inputs[input].addEventListener("change", (e) => {
            const [file] = inputs[input].files;
            if (file) {
                var reader = new FileReader();

                reader.onload = function () {
                    const dataUrl = reader.result;
                    const img = selector("#image");

                    // Preview the image
                    img.src = dataUrl;

                    // Create an image element
                    const image = new Image();

                    // Handle the image loading completion event
                    image.onload = function () {
                        console.log("loaded");

                        // Get & Set the image width & height in pixels as dataset
                        previews[input].setAttribute("data-width", image.width);
                        previews[input].setAttribute("data-height", image.height);
                    };

                    image.src = dataUrl;
                };

                reader.readAsDataURL(file);
            }
        });
    } else {
        // Get & Set the input value
        inputs[input].addEventListener("keyup", (e) => {
            previews[input].innerHTML = e.target.value;
        });
    }
}

/**
 * Reneder an anchor tag, then download the image automatically
 *
 * @param {String} dataUrl base64 string as data url.
 * @return {Void } 
 */
const download = (dataUrl) => {
    // Generating the file name by a random number
    const filename = `Poster_${Math.floor(Math.random() * 100000000)}.png`;

    // Creating an anchor tag for download the image.
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);

    // Trigger the download
    a.click();

    // Remove the anchor tag from body
    document.body.removeChild(a);
};

/**
 * Prepare the downloading content
 *
 * @return {Void } 
 */
const downloadPreprocess = () => {
    const sourceContent = document.getElementById("previewSection");

    // Creating a canvas element
    const canvas = document.createElement("canvas");

    // Set the canvas dimensions to match the source content dimensions
    canvas.width = sourceContent.offsetWidth;
    canvas.height = sourceContent.offsetHeight;
    const ctx = canvas.getContext("2d");

    // For render the image, we are froming an svg here.
    let content = `
      <svg xmlns="http://www.w3.org/2000/svg" style="background-color: white" width="${sourceContent.offsetWidth}" height="${sourceContent.offsetHeight}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font: 12px 'Arial'; padding: 20px;">
            ${sourceContent.innerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const imageDimension = previews.image.dataset;

    /* While getting the html content, weirdly '/' is missing from image tag. For this reason svg
     * formation will not valid. So, we have to add the '/' manually
     */
    let replacingString = `id="image"/>`;

    // Here we have to set the image fixed width & hieght, otherwise image will be abnormally render.
    const imageWidth = imageDimension.width;
    if (imageWidth) {
        replacingString = `id="image" width="${imageWidth > 500 ? 500 : imageWidth
            }" height="${imageDimension.height > 300 ? 300 : imageDimension.height}"/>`;
    }

    content = content.replace(`id="image">`, replacingString);

    // Convert the div content to a data URL
    const dataUrl = "data:image/svg+xml," + encodeURIComponent(content);

    // Create an image element with the data URL as the source
    const img = new Image();
    img.onload = function () {
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);

        // Download the image.
        download(canvas.toDataURL());
    };

    img.src = dataUrl;
};
