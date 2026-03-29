document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    const submitBtn = document.getElementById('send-btn');

    // Handle input changes to enable/disable button
    input.addEventListener('input', () => {
        if (input.value.trim().length > 0) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        
        if (text) {
            // Add user message
            addMessage(text, 'user');
            input.value = '';
            submitBtn.disabled = true;

            // Simulate AI typing delay and response
            simulateAIResponse();
        }
    });

    function addMessage(text, sender) {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper', sender, 'animate-in');
        
        // Remove animation class after it plays so it doesn't replay unexpectedly
        setTimeout(() => messageWrapper.classList.remove('animate-in'), 300);
        
        let innerHTML = '';
        
        if (sender === 'assistant') {
            innerHTML += `
                <div class="avatar">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=AI" alt="AI">
                </div>
            `;
        }
        
        innerHTML += `
            <div class="message-content">
                ${escapeHTML(text)}
            </div>
        `;
        
        messageWrapper.innerHTML = innerHTML;
        messagesContainer.appendChild(messageWrapper);
        scrollToBottom();
    }

    function simulateAIResponse() {
        // Show typing indicator or just delay
        setTimeout(() => {
            const responses = [
                "I can definitely help with that!",
                "That's an interesting question.",
                "Based on the UI, this seems like a great start.",
                "Let me process this for you.",
                "I'm a simulated response. You'll need to hook me up to a real backend!"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage(randomResponse, 'assistant');
        }, 800);
    }

    function scrollToBottom() {
        // Smooth scroll to bottom
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Helper to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
