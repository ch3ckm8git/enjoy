import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function PATCH(request: Request) {
    try {
        const body = await request.json();

        if (!body.username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), 'data/json/user.json');

        // Read existing data
        const fileData = await fs.readFile(filePath, 'utf8');
        const userData = JSON.parse(fileData);

        // Update username
        userData.username = body.username;

        // Write back to file
        await fs.writeFile(filePath, JSON.stringify(userData, null, 4));

        return NextResponse.json(userData);
    } catch (error) {
        console.error('Failed to update user profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
