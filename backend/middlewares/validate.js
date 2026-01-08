
export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync(req.body);
        next();
    } catch (error) {
        // Return first error message for simplicity, or all errors
        const message = error.errors?.[0]?.message || "Validation Error";
        return res.status(400).json({ message });
    }
};
