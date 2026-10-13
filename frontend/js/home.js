document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dots .dot');
    let currentIndex = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentIndex = index;
    }

    function nextSlide() {
        let nextIndex = (currentIndex + 1) % slides.length;
        showSlide(nextIndex);
    }

    function startAutoplay() {
        slideInterval = setInterval(nextSlide, 4000);
    }

    function resetAutoplay() {
        clearInterval(slideInterval);
        startAutoplay();
    }

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        showSlide(index);
        resetAutoplay();
        });
    });

    startAutoplay();
    });

// Função de favoritar
document.addEventListener('DOMContentLoaded', () => {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');

    favoriteButtons.forEach(button => {
        button.addEventListener('click', () => {
        const icon = button.querySelector('i');
        
        button.classList.toggle('active');

        if (button.classList.contains('active')) {
            // Troca o ícone para coração preenchido
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
        } else {
            // Volta para o ícone de coração vazado
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
        }
        });
    });
});