let baseUrl = "https://dummyjson.com"
let limit = 5
let userId = 5
const catalogElement = document.querySelector(".post-catalog");
const addPostForm = document.querySelector(".add-posts");

function createPostCard(post) {
    const postCard = document.createElement("div");
    postCard.classList.add("post");
    postCard.innerHTML = `
        <h2>${post.title}</h2>
        <p>${post.body}</p>
        <div class="buttons">
            <button class="btn primary">Edit Post</button>
            <button class="btn primary title">Edit title</button>
            <button class="btn danger" data-post-id="${post.id}">Delete</button>
        </div>

        <div class="edit-fields">
            <form class="edit-form">
                <input type="text" name="title" placeholder="Edit title">
                <textarea name="body" placeholder="Edit content"></textarea>
                <button class="btn primary" type="submit">Save</button>
            </form>

            <div class="loading hidden">Loading...</div>
        </div>
    `;

    catalogElement.appendChild(postCard);

    const deleteBtn = postCard.querySelector(".btn.danger");
    const editBtn = postCard.querySelector(".btn.primary");
    const editTitle = postCard.querySelector(".btn.primary.title");
    const editForm = postCard.querySelector(".edit-form");

    deleteBtn.addEventListener("click", async () => {
        await deletePost(post.id);
        postCard.remove();
    });


    editBtn.addEventListener("click", () => {
        const editFields = postCard.querySelector(".edit-fields");
        editFields.classList.toggle("active");
    });

    editTitle.addEventListener("click", () => {
        const editFields = postCard.querySelector(".edit-fields");
        editFields.classList.toggle("active");
    });


    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const updatedPost = Object.fromEntries(formData.entries());
        const loadingElement = postCard.querySelector(".loading");
        loadingElement.classList.remove("hidden");
        const result = await updatePost(post.id, updatedPost);
        setTimeout(() => {
            loadingElement.classList.add("hidden");
        }, 5000);

        postCard.querySelector("h2").textContent = result.title;
        postCard.querySelector("p").textContent = result.body;
        // console.log(result);
    })

}

async function fetchPosts() {
    const stored = localStorage.getItem("posts")
    if (stored && JSON.parse(stored).length === limit) {
        return JSON.parse(stored);
    }


    const response = await fetch(`${baseUrl}/posts?limit=${limit}`);
    const data = await response.json();

    localStorage.setItem("posts", JSON.stringify(data.posts));
    return data.posts;
}

async function createNewPost(post) {

    const response = await fetch(`${baseUrl}/posts/add`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...post, userId})
    })

    const newPost = await response.json()
    return newPost;
}

async function updatePost(postId, post) {

    if (post.body !== '' && post.title !== '') {
        const response = await fetch(`${baseUrl}/posts/${postId}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post)
        });
        const updatedPost = await response.json();
        return updatedPost;
    } else {
        const response = await fetch(`${baseUrl}/posts/${postId}`, {
            method: "PATCH",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post)
        });
        const updatedPost = await response.json();
        return updatedPost;
    }
}

async function deletePost(postId) {
    const response = await fetch(`${baseUrl}/posts/${postId}`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' }
    })
    const result = await response.json();

    console.log(result);
    return result;
}

fetchPosts().then(posts => posts.forEach(post => createPostCard(post)));

addPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let formdata = new FormData(addPostForm);
    let post = Object.fromEntries(formdata.entries());

    // Create a new post with the form data and call the api from dummyjson.com
    const newPost = await createNewPost(post);

    // Create the html for the new post and append it to the catalog
    createPostCard(newPost);

    addPostForm.reset();

});