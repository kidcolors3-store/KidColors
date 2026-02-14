
var selectedPayment = ""; 
var finalPayable = 0;
window.uploadedPhotoUrl = "No Photo Uploaded"; 


(function() {
    emailjs.init("Jwwq070H1nq9eOjzD"); 
    console.log("EmailJS Initialized!");
})();

window.onload = function() {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    let bookSection = document.getElementById('book-details-section');
    
    let hasMainProduct = cart.some(item => item.name && item.name.trim() === "Little Artists World");
    if (hasMainProduct && bookSection) {
        bookSection.style.display = "block"; 
    }

    let savedTotal = localStorage.getItem('cartTotal') || "0";
    let uniquePoint = (Math.random() * (0.99 - 0.01) + 0.01).toFixed(2);
    finalPayable = (parseFloat(savedTotal) + parseFloat(uniquePoint)).toFixed(2);
    
    let displayElement = document.getElementById('finalPriceDisplay');
    if (displayElement) {
        displayElement.innerText = "Rs. " + finalPayable;
    }
};


window.previewImage = function(event) {
    const file = event.target.files[0];
    const btn = document.getElementById('confirmBtn');
    if (!file) return;

  
    const reader = new FileReader();
    reader.onload = function() {
        const previewImg = document.getElementById('imagePreview');
        const previewContainer = document.getElementById('imagePreviewContainer');
        if(previewImg) previewImg.src = reader.result;
        if(previewContainer) previewContainer.style.display = 'block';
    }
    reader.readAsDataURL(file);

    
    if(btn) {
        btn.innerText = "Uploading Photo... 📷";
        btn.disabled = true;
    }

    const formData = new FormData();
    formData.append("image", file);
    
    fetch("https://api.imgbb.com/1/upload?key=b3ae5fc4c8d1784c344cfc360e37735e", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            window.uploadedPhotoUrl = data.data.url; 
            console.log("ImgBB Link:", window.uploadedPhotoUrl);
            if(btn) {
                btn.innerText = "Confirm Order";
                btn.disabled = false;
            }
        }
    })
    .catch(err => {
        console.error("Upload Error:", err);
        if(btn) btn.disabled = false;
    });
};

window.selectPayment = function(method, element) {
    selectedPayment = method;
    document.querySelectorAll('.payment-card').forEach(card => {
        card.style.border = "1px solid #ddd";
        card.style.background = "white";
    });
    element.style.border = "2px solid #8b5e3c";
    element.style.background = "#fff5f0";
};


window.confirmOrder = async function() {
    try {

        const btn = document.getElementById('confirmBtn');
        const nameVal = document.getElementById('custName').value;
        const addressVal = document.getElementById('custAddress').value;
        
      
        const cityVal = document.getElementById('citySelect') ? document.getElementById('citySelect').value : "N/A";
        const countryVal = document.getElementById('countrySelect') ? document.getElementById('countrySelect').value : "N/A";
        const bookNameVal = document.getElementById('bookNameInput') ? document.getElementById('bookNameInput').value : "Not Provided";

        
        let cart = JSON.parse(localStorage.getItem('myCart')) || [];
        let needsPhoto = cart.some(item => item.name && item.name.trim() === "Little Artists World");

   

   
        let productDetailsText = cart.map(item => `${item.name} (x${item.quantity || 1})`).join(" | ");

        btn.innerText = "Sending... ⏳";
        btn.disabled = true;

        const params = {
            orderNo: "KC-" + Math.floor(Date.now() / 1000),
            name: nameVal,
            whatsapp: document.getElementById('custWhatsApp').value || "N/A",
            email: document.getElementById('custEmail').value || "N/A",
            address: `${addressVal}, ${cityVal}, ${countryVal}`,
            product_details: productDetailsText,
            bookName: bookNameVal,
            photoLink: window.uploadedPhotoUrl,
            paymentMethod: selectedPayment,
            tid: document.getElementById('transID').value || "N/A",
            total: "Rs. " + finalPayable
        };
        emailjs.send('service_gbcpqmd', 'template_pimd8s8', params)
        .then(function(res) {
            sendDataToGoogleSheet(params);
            document.getElementById('orderPopup').style.display = 'flex';
            btn.innerText = "Order Placed ✅";
            console.log("SUCCESS!", res);
        }, function(err) {
            alert("Email Send Fail! Reason: " + (err.text || JSON.stringify(err)));
            btn.disabled = false;
            btn.innerText = "Confirm Order";
        });
        

    } catch (error) {
        console.error("Order Error:", error);
    }


};
function blurCODForMainProduct() {

    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    
    let hasMainProduct = cart.some(item => item.name && item.name.trim() === "Little Artists World");

    let codButton = document.getElementById('codBtn');

    if (hasMainProduct && codButton) {
       
        codButton.style.filter = "blur(0px) grayscale(100%)"; 
        codButton.style.opacity = "0.6";
        codButton.style.pointerEvents = "none";
        codButton.style.cursor = "not-allowed";
        
        
        codButton.innerText = "🚚 COD (Not Available)";
    }
}


window.addEventListener('load', blurCODForMainProduct);


function sendDataToGoogleSheet(orderData) {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxrJ2wF7P03ohKk53aLeFlPTadmrpmbOHZkXRRRlNqYyXgsdQtWlGJbjMhpcwbOFRs-Ew/exec';

    const params = new URLSearchParams();
    params.append('order_id', orderData.orderNo);
    params.append('name', orderData.name);
    params.append('whatsapp', orderData.whatsapp);
    params.append('address', orderData.address);
    params.append('payment_method', orderData.paymentMethod);
    params.append('total', orderData.total);
    params.append('items', orderData.product_details);

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', 
        body: params
    })
    .then(() => console.log("Data Sent to Sheet!"))
    .catch(error => console.error('Sheet Error!', error.message));
}

// --- ZABARDASTI ALERT CODE (ID CONFLICT FIXED) ---
document.getElementById('confirmBtn').addEventListener('click', function(e) {
    let cart = JSON.parse(localStorage.getItem('myCart')) || [];
    
    // Ye code dono IDs check karega (name/custName aur address/custAddress)
    let nameInput = document.getElementById('name') || document.getElementById('custName');
    let addressInput = document.getElementById('address') || document.getElementById('custAddress');
    let transInput = document.getElementById('transID') || document.getElementById('tid');

    let nameVal = nameInput ? nameInput.value.trim() : "";
    let addressVal = addressInput ? addressInput.value.trim() : "";
    let transIDVal = transInput ? transInput.value.trim() : "";
    
    // 1. Details Check (Name & Address)
    if (nameVal === "" || addressVal === "") {
        alert("❌ Please enter your Name and Full Address!");
        e.stopImmediatePropagation();
        e.preventDefault();
        return;
    }

    // 2. Payment Method Check
    if (!window.selectedPayment || window.selectedPayment === "") {
        alert("❌ Please select a Payment Method!");
        e.stopImmediatePropagation();
        e.preventDefault();
        return;
    }

    // 3. Photo Upload Check
    let needsPhoto = cart.some(item => item.name && item.name.includes("Little Artists World"));
    if (needsPhoto && (window.uploadedPhotoUrl === "No Photo Uploaded" || !window.uploadedPhotoUrl)) {
        alert("📷 Please upload your Payment Screenshot first!");
        e.stopImmediatePropagation();
        e.preventDefault();
        return;
    }

    // 4. Transaction ID Check (Agar COD nahi hai)
    if (window.selectedPayment !== "COD" && transIDVal === "") {
        alert("❌ Please enter Transaction ID!");
        e.stopImmediatePropagation();
        e.preventDefault();
        return;
    }

    // 5. Quantity Limit Check
    let totalMainBooks = 0;
    for (let i = 0; i < cart.length; i++) {
        let n = cart[i].name ? cart[i].name.toLowerCase() : "";
        if (n.includes("little artists world")) {
            totalMainBooks += (cart[i].quantity || cart[i].qty || 1);
        }
    }

    if (totalMainBooks > 1) {
        alert("❌ STOP! Order 'Little Artists World' 1-by-1.");
        e.stopImmediatePropagation();
        e.preventDefault();
        throw new Error("Limit Exceeded");
    }

}, true);