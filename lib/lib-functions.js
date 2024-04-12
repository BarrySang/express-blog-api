const TextGenerator = require("./TextGenerator")

function generateBlogs(numberOfBlogs) {
    // initialize 'blogs' array
    let blogs = []

    // TextGenerator object
    const textGenerator = new TextGenerator()

    const date = new Date()

    // loop as many times as defined in 'numberOfBlogs' parameter
    for (let i = 0; i < numberOfBlogs; i++) {
        const blog = {
            id: blogs.length ? blogs[blogs.length - 1].id + 1 : 1,
            user: blogs.length ? 'user'+(blogs[blogs.length - 1].id + 1) : 'user1',
            title: textGenerator.generateSentence(10, 5),
            body: textGenerator.generateParagraph(20, 7, 5),
            created_on: date.getDate()+'-'+date.getMonth()+'-'+date.getFullYear(),
            updated_on: date.getDate()+'-'+date.getMonth()+'-'+date.getFullYear()
        }

        // add blog to 'blogs' array
        blogs.push(blog)
    }

    return blogs
}

function getUpdatedFields(blogClient, blogServer) {
    let unequalFields = []

    for (let key in blogClient) {
        if (blogClient[key] !== blogServer[key])  {
            
            unequalFields.push(key)
        }
    }

    return unequalFields
}

module.exports = {
    generateBlogs,
    getUpdatedFields
}