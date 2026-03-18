import prisma from '../config/prisma.js';

export const getRules = async (req, res) => {
    try {
        const rules = await prisma.chatbotRule.findMany({
            where: { user_id: req.user.id }
        });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createRule = async (req, res) => {
    try {
        const { trigger_keyword, reply_template } = req.body;
        const rule = await prisma.chatbotRule.create({
            data: {
                trigger_keyword,
                reply_template,
                user_id: req.user.id
            }
        });
        res.status(201).json(rule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteRule = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.chatbotRule.delete({
            where: { id: parseInt(id), user_id: req.user.id }
        });
        res.json({ message: 'Rule deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
