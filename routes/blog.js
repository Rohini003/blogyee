const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// Route for adding a new blog post
router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user, // Assuming you have user information available in the request
  });
});

// Route for viewing a single blog post
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");

  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

// Route for adding a comment to a blog post
router.post("/comment/:blogId", async (req, res) => {
  try {
    await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id, // Assuming you have user information available in the request
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    // Handle any errors, e.g., return an error response or redirect to an error page.
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

// Route for adding a new blog post with file upload
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body } = req.body;
    const blog = await Blog.create({
      body,
      title,
      createdBy: req.user._id, // Assuming you have user information available in the request
      coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    // Handle any errors, e.g., return an error response or redirect to an error page.
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

