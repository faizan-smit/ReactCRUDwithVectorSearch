window.createPost = function () {

    let postTitle = document.querySelector("#postTitle").value;
    let postText = document.querySelector("#postText").value;

    // baseUrl/api/v1/post
    axios.post(`/api/v1/post`, {
        title: postTitle,
        text: postText
    })
        .then(function (response) {
            console.log(response.data);
            document.querySelector("#result").innerHTML = response.data;
            getAllPost();
        })
        .catch(function (error) {
            // handle error
            console.log(error.data);
            document.querySelector("#result").innerHTML = "Error in post submission"
        })
}




window.getAllPost = function () {


    // baseUrl/api/v1/post
    axios.get(`/api/v1/posts`)
        .then(function (response) {
            console.log(response.data);

            document.querySelector("#posts").innerHTML = "";


            response.data.forEach((data, index) => {

            let posts = document.getElementById("posts");
            let postCard = document.createElement("div");
            postCard.classList.add("post-Card");
            let postCardTitle = document.createElement("div");
            postCardTitle.classList.add("post-Card-title");
            let postCardContent = document.createElement("div");
            postCardContent.classList.add("post-Card-content");
            let titleText = document.createTextNode(data.title);
            let contentText = document.createTextNode(data.text);
            let editButton = document.createElement("button");
            editButton.innerHTML = `Edit Post`;
            editButton.classList.add("edit-button");
            editButton.setAttribute("ref", data._id);
            editButton.addEventListener("click", edit);
            let deleteButton = document.createElement("button");
            deleteButton.innerHTML = `Delete`;
            deleteButton.classList.add("delete-button");
            deleteButton.setAttribute("ref", data._id);
            deleteButton.addEventListener("click", deletePost);
            let buttonsDiv = document.createElement("div");
            postCardTitle.appendChild(titleText);
            postCardContent.appendChild(contentText);
            postCard.appendChild(postCardTitle);
            postCard.appendChild(postCardContent);
            buttonsDiv.appendChild(editButton);
            buttonsDiv.appendChild(deleteButton);
            postCard.appendChild(buttonsDiv);
            posts.appendChild(postCard);


// document.querySelectorAll(".edit-button").forEach((loop)=>{

// loop.addEventListener("click", edit)


//  });


        })
            




            
        })
        .catch(function (error) {
            // handle error
            console.log(error);
            document.querySelector("#result").innerHTML = "Error in getting posts"
            if (error.response.status === 401) {
                console.log(error.response.status);
                window.location.href = "/signin.html";
            }
        })


// let postEditButton = document.querySelector(".edit-button");
// console.log(postEditButton)
// postEditButton.addEventListener("click", (foo)=> {


//                 console.log(foo.target.parentNode);
//                 let theRef = parseInt(foo.target.attributes.ref.value);
//                 console.log(theRef);

//                 foo.target.parentNode.parentNode.innerHTML = `

//                 <input type="text">
                

                
//                 `


// })


}


let edit = (event)=>{


    
    console.log(event.target.parentNode);
    let theRef = event.target.attributes.ref.value;
    console.log(theRef);


    let title = event.target.parentNode.parentNode.firstChild.innerHTML;
    let text = event.target.parentNode.parentNode.children[1].innerHTML;
    console.log(text);
    let parentDiv = event.target.parentNode.parentNode
    parentDiv.innerHTML = "";
    let editTitle = document.createElement(`input`);
    editTitle.type = 'text';
    editTitle.value = title;
    let editText = document.createElement(`input`);
    editText.type = 'text';
    editText.value = text;
    let saveButton = document.createElement(`button`);
    saveButton.type = 'submit';
    saveButton.innerHTML = 'Save';
    saveButton.classList.add('save-btn');
    saveButton.setAttribute('referer', theRef)
    saveButton.addEventListener('click', save);

    parentDiv.appendChild(editTitle);
    parentDiv.appendChild(editText);
    parentDiv.appendChild(saveButton);

}


let save = (event)=> {

    let editRef = event.target.attributes.referer.value;
    let theTitle = event.target.parentNode.firstChild.value;
    let theText = event.target.parentNode.children[1].value;
    console.log(editRef);

    axios.put(`/api/v1/post/edit/${editRef}`, {

        title: theTitle,
        text: theText,

    })
    .then( (response)=>{

        console.log("done");
        console.log(response);
        getAllPost();

    })
    .catch( (err)=>{

        console.log(err);

    });


};

let deletePost = (event)=>{


    let delRef = event.target.getAttribute('ref');
    console.log(delRef);

    axios.delete(`/api/v1/post/delete/${delRef}`,)
    .then( (response)=>{

        console.log("deleted");
        getAllPost();

    })
    .catch( (err)=>{

        console.log(err);

    });


}


let logout = document.getElementById("Logout");

logout.addEventListener("click", function(event) {

    axios.post('/logout',{})
    .then(function(response) {

        location.href = '/signin.html';


     })
    .catch(function(err) { });



});