window.onload = function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const imageName = urlParams.get('image');

    document.getElementById('imageToEdit').src = `uploads/${imageName}`;
}

imageToEdit = document.getElementById('imageToEdit')

// Wait for the DOM content to be fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function() {
    // Get references to the sliders and the image
    const rSlider = document.getElementById("rSlider");
    const gSlider = document.getElementById("gSlider");
    const bSlider = document.getElementById("bSlider");
    const imageToEdit = document.getElementById("imageToEdit");

    // Load the image using glfx.js
    const image = document.getElementById('imageToEdit');
    image.src = imageToEdit.src;
    image.onload = function() {
        // Create a canvas and context for glfx.js
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        // Apply the color filter using glfx.js
        const filter = new window.fx.canvas();
        filter.loadTexture(image);
        
        // Function to update the color of the image
        function updateColor() {
            // Get the RGB values from the sliders
            const rValue = rSlider.value;
            const gValue = gSlider.value;
            const bValue = bSlider.value;
            
            // Apply the color filter to the image
            filter.reset();
            filter.draw(canvas);
            filter.curves([0, 0], [rValue / 255, gValue / 255], [bValue / 255, 1]);
            filter.update();
        
            // Update the image src with the filtered data
            imageToEdit.src = canvas.toDataURL();
        }

        // Attach onchange event listeners to the sliders
        rSlider.addEventListener("input", updateColor);
        gSlider.addEventListener("input", updateColor);
        bSlider.addEventListener("input", updateColor);

        // Call updateColor function initially to set the default color
        updateColor();
    };
});
