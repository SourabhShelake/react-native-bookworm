import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import Book from '../models/Book.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/", protectRoute, async (req,res) => {
    try {
        const { titel, caption, rating, image } = req.body;
        if (!titel || !caption || !rating || !image) {
            return res.status(400).json({ message: "Plese provide all fields" });
        }

        // Upload image to the cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.sequre_url;

        // Save book to the database
        const newBook = new Book({
            titel,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id, 
        })

        await newBook.save();
        res.status(201).json(newBook);
        
    } catch (error) {
        console.error("Error creating book", error);
        res.status(500).json({ message: "Error.message"});
    }
});

// pagination =>  infinite loading
router.get("/", protectRoute, async (req, res) => {
    // example call fromreact -forntend
    // const response = await fetch("http://localhost:3000/api/books/?page=1&limit=5");
    try {
        const page = req.query.page || 1;
        const limit = req.query.page || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find()
         .sort({ createdAt: -1 })  // descending order
         .skip(skip)
         .limit(limit)
         .populate("user","username profileImage ");

        const totalBooks = await Book.countDocuments();

        res.send({
         books,
         totalBooks,
         totalPages: math.ceil(totalBooks / limit),
        });

    } catch (error) {
        console.log("Error fetching books", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/:id", protectRoute, async (req, res) => {
    try {
      const book = await Book.find({ _id: req.params.id }).sort({ createdAt: -1 });
      res.json(books);

    } catch (error) {
        console.error("Get user books error", error.message);
        res.status(500).json({ message: "server error" });
    }
});

router.delete("/:id", protectRoute, async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if(!book) return res.status(404).json({ message: "Book not found" }); 

        // chake if user is the creator the book
      if (book.user.toString() !== req.user._id.toString()) {
          return res.status(401).json({ message: "Unauthorised" });
      }

        // Delete image from cloudinary
      if(book.image && book.image.includes("cloudinary")) {
          try {
            const publicId = book.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
    
          } catch (deleteError) {
            console.log("Error deleting image from Cloudinary", deleteError);
          }
      }

        // Delete book from the database
      await book.deleteOne();
      res.json({ message: "Book deleted successfully" });

    } catch (error) {
        console.error("Error deleting book", error);
        res.status(500).json({ message: "Internal server error" }); 
    }
});

export default router;