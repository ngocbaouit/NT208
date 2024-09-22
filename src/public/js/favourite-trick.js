document.addEventListener('DOMContentLoaded', async function() {
    await markFavouriteTricks();
});

const hearts = document.querySelectorAll('.heart');
const animations = document.querySelectorAll('.animation-heart');

async function markFavouriteTricks() {
    try {
        const response = await fetch('/v1/GetFavouriteTrick');
        const favouriteTricks = await response.json(); 

        hearts.forEach((heart, index) => {
            const card = heart.closest(".card-course-item");
            const SLUG = card.getAttribute('data-slug');
            const trick = favouriteTricks.find(trick => trick.SLUG === SLUG);

            requestAnimationFrame(() => {
                if (trick) {
                    if (animations[index]) {
                        animations[index].classList.add('animation');
                    }
                    heart.classList.add('fill-color');
                } else {
                    if (animations[index]) {
                        animations[index].classList.remove('animation');
                    }
                    heart.classList.remove('fill-color');
                }
            });
        });
    } catch (error) {
        console.error('There was an error fetching favourite tricks!', error);
    }
}

hearts.forEach((heart, index) => {
    heart.addEventListener('mousedown', async (event) => {
        const card = event.target.closest(".card-course-item");
        const SLUG = card.getAttribute('data-slug');
        const NAME = card.getAttribute('data-name');
        const IMAGE = card.getAttribute('data-image');

        requestAnimationFrame(() => {
            if (animations[index]) {
                animations[index].classList.add('animation');
            }
            heart.classList.add('fill-color');
        });

        await postData('/v1/FavouriteTrick', { SLUG, NAME, IMAGE });
    });
});

animations.forEach((animation, index) => {
    animation.addEventListener('mousedown', async (event) => {
        const card = event.target.closest(".card-course-item");
        const heart = card.querySelector(".heart");
        const SLUG = card.getAttribute('data-slug');
        const NAME = card.getAttribute('data-name');
        const IMAGE = card.getAttribute('data-image');

        requestAnimationFrame(() => {
            animation.classList.remove('animation');
            heart.classList.remove('fill-color');
        });

        await postData('/v1/FavouriteTrick', { SLUG, NAME, IMAGE });
    });
});

async function postData(url = '', data = {}) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Success:', result);
    } catch (error) {
        console.error('There was an error!', error);
    }
}
