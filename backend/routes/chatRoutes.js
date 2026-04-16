const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* GET conversations: people I've chatted with + last message + unread count */
router.get("/conversations", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const sent = await Message.find({ sender: userId }).distinct("receiver");
    const received = await Message.find({ receiver: userId }).distinct("sender");
    const peerIds = [...new Set([...sent.map(String), ...received.map(String)])].filter((id) => id !== userId);

    const conversations = await Promise.all(
      peerIds.map(async (peerId) => {
        const peer = await User.findById(peerId).select("name email department");
        const lastMsg = await Message.findOne({
          $or: [
            { sender: userId, receiver: peerId },
            { sender: peerId, receiver: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .lean();
        const unread = await Message.countDocuments({
          sender: peerId,
          receiver: userId,
          readAt: null,
        });
        return {
          user: peer,
          lastMessage: lastMsg,
          unreadCount: unread,
        };
      })
    );

    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* GET messages with a specific user */
router.get("/messages/:peerId", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const peerId = req.params.peerId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: peerId },
        { sender: peerId, receiver: userId },
      ],
    })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: 1 })
      .lean();

    await Message.updateMany(
      { sender: peerId, receiver: userId, readAt: null },
      { readAt: new Date() }
    );

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* POST send message */
router.post("/messages", protect, async (req, res) => {
  try {
    const { receiver, content } = req.body;
    if (!receiver || !content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "receiver and content required" });
    }

    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (receiver === req.user.id) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver,
      content: content.trim(),
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "name")
      .populate("receiver", "name");

    // Notify receiver
    const senderName = populated.sender?.name || "Someone";
    await Notification.create({
      user: receiver,
      message: `${senderName} sent you a message: "${content.trim().slice(0, 50)}${content.trim().length > 50 ? "..." : ""}"`,
      type: "CHAT",
    });

    res.status(201).json({ message: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
