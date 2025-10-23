class EntriesController {
    constructor(private entryService: EntryService) {}

    async createEntry(req: Request, res: Response): Promise<void> {
        try {
            const entryData: EntryRequest = req.body;
            const newEntry = await this.entryService.createEntry(entryData);
            res.status(201).json(newEntry);
        } catch (error) {
            res.status(500).json({ message: 'Error creating entry', error });
        }
    }

    async getEntries(req: Request, res: Response): Promise<void> {
        try {
            const entries = await this.entryService.getEntries();
            res.status(200).json(entries);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving entries', error });
        }
    }
}

export default EntriesController;