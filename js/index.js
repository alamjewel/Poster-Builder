/**
 * short form of document.querySelector
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
 * @return {Void}
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
                const reader = new FileReader();

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

                        /* Get & Set the image width & height in pixels as dataset in the parent node.
                         * We store the data set in the parent not because, for one case we have to remain
                         * the image tag as it is.
                         */
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
 * Apply heading text styles. Such as alignment and color
 *
 * @param {String} type kind of style
 * @param {String} value new value for the style.
 * @return {Void }
 */
const applyTextStyles = (type, value) => {
    // List of styles for alignment & color.
    const list =
        type === "color"
            ? ["blue-600", "black", "green-600"]
            : ["left", "center", "right"];

    // Remove the old style
    list.forEach((_value) => previews.heading.classList.remove(`text-${_value}`));

    // apply the new style.
    previews.heading.classList.add(`text-${value}`);
};

/**
 * Reneder an anchor tag, then download the image automatically
 *
 * @param {String} dataUrl base64 string as data url.
 * @return {Void}
 */
const download = (dataUrl) => {
    // Generating the file name by a random number
    const filename = `Poster_${Math.floor(Math.random() * 100000000)}.png`;

    // Creating an anchor tag for download the image.
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;

    // Append the anchor tag to the body tag.
    document.body.appendChild(a);

    // Trigger the download
    a.click();

    // Remove the anchor tag from body
    document.body.removeChild(a);
};

/**
 * Prepare the downloading content.
 * By creating a canvas, then bind the source content within the SVG.
 *
 * @return {Void}
 */
const downloadPreprocess = () => {
    // Preview section
    const sourceContent = selector("#previewSection");

    // Creating a canvas element
    const canvas = document.createElement("canvas");

    // Set the canvas dimensions to match the source content dimensions
    canvas.width = sourceContent.offsetWidth;
    canvas.height = sourceContent.offsetHeight + 100;
    const ctx = canvas.getContext("2d");

    /* We have to manually recreate the source content. Because we are not getting the computed style,
     * while get the content using inner html.
     */
    let content = ``;
    if (previews.heading.textContent) {
        // get the computed styles of the heading element
        const { alignment, color, fontSize } = getHeadingComputedStyle();
        content += `<h1 style="text-align: ${alignment}; color: ${color}; font-size: ${fontSize}; font-weigth: 400;">${previews.heading.textContent}</h1>`;
    }

    const image = selector("#image")
    if (image.src) {
        // Get the image dimension from parent node of image.
        const imageDimension = previews.image.dataset;

        // Here we have to set the image fixed width & hieght, otherwise image will be rendered abnormally.
        const imageWidth = imageDimension.width > 500 ? 500 : imageDimension.width;
        const imageHeight = imageDimension.height > 300 ? 300 : imageDimension.height;
        content += `<img src="${image.src}" width="${imageWidth}" height="${imageHeight}" style="display: block; margin: 0 auto;"/>`
    }

    if (previews.description.textContent) content += `<p style="white-space: pre-wrap;">${previews.description.textContent}</p>`

    // For render the image, we are forming an svg.
    if (content) {
        content = `
          <svg xmlns="http://www.w3.org/2000/svg" style="background-color: white" width="${canvas.width}" height="${canvas.height}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="font: 12px 'Arial'; padding: 20px;">
                ${content}
              </div>
            </foreignObject>
          </svg>
        `;

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
    }
};


/**
 * Get the computed style of heading.
 *
 * @return {Object} aligment, color & fontSize
 */
const getHeadingComputedStyle = () => {
    // Get the computed styles of the element
    const styles = window.getComputedStyle(previews.heading);

    // Get the text alignment property
    const alignment = styles.getPropertyValue("text-align");

    // Get the text alignment property
    const color = styles.getPropertyValue("color");

    // Get the text alignment property
    const fontSize = styles.getPropertyValue("font-size");

    return { alignment, color, fontSize };
}
