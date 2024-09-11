import {FileStorageService, UploadResult} from "./s3.service.js";
import {DeleteMediaDto} from "./dto.js";
import * as fs from "fs";
import * as path from "path";
import logger from "../../logger.js";

const __dirname = path.resolve(path.dirname(""));

export class MockedStroageService implements FileStorageService {
    private storagePath = __dirname + "/tmp";

    constructor() {
        logger.info("MockedStroageService: storagePath", this.storagePath);
    }

    async deleteFile(fileDto: DeleteMediaDto): Promise<{ deleted: boolean }> {
        const filePath = path.join(this.storagePath, fileDto.key);

        // Check if the file exists and delete it
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return {deleted: true};
        }

        return {deleted: false};
    }

    async uploadFile(
        dataBuffer: Buffer,
        filename: string,
        folder: string,
    ): Promise<UploadResult> {
        const fullFilename = `${folder}/${filename}`;
        const filePath = path.join(this.storagePath, fullFilename);

        // Simulate writing the file to the local filesystem
        writeFileSyncRecursive(filePath, dataBuffer);

        return new UploadResult({
            url: `file://${filePath}`, // Use a file:// URL to represent local files
            key: fullFilename,
        });
    }
}

function writeFileSyncRecursive(filename, content) {
    // -- normalize path separator to '/' instead of path.sep,
    // -- as / works in node for Windows as well, and mixed \\ and / can appear in the path
    let filepath = filename.replace(/\\/g, "/");

    // -- preparation to allow absolute paths as well
    let root = "";
    if (filepath[0] === "/") {
        root = "/";
        filepath = filepath.slice(1);
    } else if (filepath[1] === ":") {
        root = filepath.slice(0, 3); // c:\
        filepath = filepath.slice(3);
    }

    // -- create folders all the way down
    const folders = filepath.split("/").slice(0, -1); // remove last item, file
    folders.reduce(
        (acc, folder) => {
            const folderPath = acc + folder + "/";
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            return folderPath;
        },
        root, // first 'acc', important
    );

    // -- write file
    fs.writeFileSync(filename, content);
}
