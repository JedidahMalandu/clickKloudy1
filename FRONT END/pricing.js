document.addEventListener('DOMContentLoaded', () => {
    const pricingData = {
        'Free Trial': { price: 0.00, accounts: 10 },
        '10 Accounts': { price: 4.99, accounts: 10 },
        '25 Accounts': { price: 9.99, accounts: 25 },
        '50 Accounts': { price: 29.99, accounts: 50 },
        '100 Accounts': { price: 39.99, accounts: 100 },
        '200 Accounts': { price: 49.99, accounts: 200 },
        '300 Accounts': { price: 59.99, accounts: 300 },
        '400 to 1000 Accounts': { price: 99.99, accounts: 1000 }
    };

    const plans = document.querySelectorAll('.plan');
    const ctaButtons = document.querySelectorAll('.cta-btn');
    const apiEndpoint = 'https://api.yourbackend.com'; // Replace with your actual API endpoint

    plans.forEach(plan => {
        plan.addEventListener('mouseenter', handlePlanHover);
        plan.addEventListener('mouseleave', handlePlanLeave);
    });

    function handlePlanHover(e) {
        const plan = e.currentTarget;
        plan.style.transform = 'translateY(-10px)';
        plan.style.transition = 'all 0.3s ease';
        plan.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
    }

    function handlePlanLeave(e) {
        const plan = e.currentTarget;
        plan.style.transform = 'translateY(0)';
        plan.style.boxShadow = 'none';
    }

    ctaButtons.forEach(button => {
        button.addEventListener('click', handlePlanSelection);
    });

    function handlePlanSelection(e) {
        e.preventDefault();
        const selectedPlan = e.target.closest('.plan');
        const planTitle = selectedPlan.querySelector('h2').textContent;
        const planPrice = selectedPlan.querySelector('.price').textContent;
        showPaymentModal(planTitle, planPrice);
    }

    function createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.style.border = '4px solid #f3f3f3';
        spinner.style.borderTop = '4px solid #3498db';
        spinner.style.borderRadius = '50%';
        spinner.style.width = '40px';
        spinner.style.height = '40px';
        spinner.style.animation = 'spin 1s linear infinite';
        
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
        
        return spinner;
    }

    function showPaymentModal(planTitle, planPrice) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.innerHTML = `
            <h3>Select Payment Method</h3>
            <p>Selected Plan: ${planTitle}</p>
            <p>Price: ${planPrice}</p>
            <div id="paypal-button-container"></div>
            <button class="cancel-btn" style="margin-top: 20px; padding: 10px 20px; background-color: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
        `;

        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';

        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '2rem';
        modalContent.style.borderRadius = '8px';
        modalContent.style.minWidth = '300px';
        modalContent.style.position = 'relative';

        modal.appendChild(modalContent);

        const cancelBtn = modalContent.querySelector('.cancel-btn');
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.body.appendChild(modal);
        initializePayPalButton(planTitle, extractPrice(planPrice), modal);
    }

    function extractPrice(priceString) {
        return parseFloat(priceString.replace(/[^\d.-]/g, ''));
    }

    function initializePayPalButton(planTitle, price, modal) {
        const loadingSpinner = createLoadingSpinner();
        const buttonContainer = modal.querySelector('#paypal-button-container');
        buttonContainer.appendChild(loadingSpinner);

        paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'paypal'
            },
            createOrder: async function(data, actions) {
                try {
                    const orderData = {
                        purchase_units: [{
                            description: `Subscription to ${planTitle}`,
                            amount: {
                                currency_code: 'USD',
                                value: price.toString()
                            }
                        }]
                    };
                    return actions.order.create(orderData);
                } catch (error) {
                    console.error('Error creating PayPal order:', error);
                    showErrorMessage('Failed to create order. Please try again.');
                    throw error;
                }
            },
            onApprove: async function(data, actions) {
                try {
                    buttonContainer.appendChild(loadingSpinner);
                    const details = await actions.order.capture();
                    await handleSuccessfulPayment(details, planTitle, modal);
                } catch (error) {
                    console.error('Error processing payment:', error);
                    showErrorMessage('Payment processing failed. Please try again.');
                    throw error;
                } finally {
                    buttonContainer.removeChild(loadingSpinner);
                }
            },
            onError: function(err) {
                console.error('PayPal Error:', err);
                showErrorMessage('Payment failed. Please try again.');
                buttonContainer.removeChild(loadingSpinner);
            },
            onCancel: function() {
                showErrorMessage('Payment cancelled. Please try again when ready.');
                buttonContainer.removeChild(loadingSpinner);
            }
        }).render('#paypal-button-container');
    }

    async function handleSuccessfulPayment(details, planTitle, modal) {
        try {
            await sendPaymentToServer({
                orderId: details.id,
                planTitle: planTitle,
                payerEmail: details.payer.email_address,
                paymentStatus: details.status,
                amount: details.purchase_units[0].amount.value,
                currency: details.purchase_units[0].amount.currency_code,
                timestamp: new Date().toISOString()
            });

            if (modal) {
                document.body.removeChild(modal);
            }

            showSuccessMessage(`Payment successful! Your ${planTitle} subscription is now active.`);
            updateUIAfterSuccessfulPayment(planTitle);
        } catch (error) {
            console.error('Error handling successful payment:', error);
            showErrorMessage('Error activating subscription. Please contact support.');
            throw error;
        }
    }

    async function sendPaymentToServer(paymentDetails) {
        try {
            const response = await fetch(`${apiEndpoint}/process-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify(paymentDetails)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending payment to server:', error);
            throw error;
        }
    }

    function updateUIAfterSuccessfulPayment(planTitle) {
        const selectedPlan = Array.from(plans).find(plan => 
            plan.querySelector('h2').textContent === planTitle
        );
        
        if (selectedPlan) {
            const button = selectedPlan.querySelector('.cta-btn');
            button.textContent = 'Active Plan';
            button.style.backgroundColor = '#27ae60';
            button.disabled = true;
        }
    }

    function showSuccessMessage(message) {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = message;
        Object.assign(successMsg.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '1rem',
            borderRadius: '4px',
            zIndex: '1000',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            animation: 'slideIn 0.5s ease-out'
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(successMsg);
        setTimeout(() => {
            successMsg.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => document.body.removeChild(successMsg), 450);
        }, 5000);
    }

    function showErrorMessage(message) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = message;
        Object.assign(errorMsg.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#f44336',
            color: 'white',
            padding: '1rem',
            borderRadius: '4px',
            zIndex: '1000',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            animation: 'slideIn 0.5s ease-out'
        });

        document.body.appendChild(errorMsg);
        setTimeout(() => {
            errorMsg.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => document.body.removeChild(errorMsg), 450);
        }, 5000);
    }

    function initializeMobileNav() {
        if (window.innerWidth < 768) {
            const pricingPlans = document.querySelector('.pricing-plans');
            Object.assign(pricingPlans.style, {
                flexDirection: 'column',
                padding: '10px'
            });

            document.querySelectorAll('.plan').forEach(plan => {
                Object.assign(plan.style, {
                    width: '100%',
                    margin: '10px 0',
                    maxWidth: '400px',
                    alignSelf: 'center'
                });
            });
        } else {
            const pricingPlans = document.querySelector('.pricing-plans');
            pricingPlans.style.flexDirection = '';
            document.querySelectorAll('.plan').forEach(plan => {
                plan.style.width = '';
                plan.style.margin = '';
                plan.style.maxWidth = '';
                plan.style.alignSelf = '';
            });
        }
    }

    initializeMobileNav();
    window.addEventListener('resize', debounce(initializeMobileNav, 250));

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});