import fs from "fs";
import path from "path";
import yaml from "js-yaml";

function loadYaml(filePath: string): any {
	return yaml.load(fs.readFileSync(filePath, "utf8"));
}

function saveYaml(filePath: string, data: any): void {
	fs.writeFileSync(filePath, yaml.dump(data, { lineWidth: -1 }), "utf8");
}

function replaceValues(data: any, replacements: Record<string, string>) {
	for (const key in replacements) {
		const value = process.env[replacements[key]];
		if (value) {
			const pathKeys = key.split(".");
			let current = data;
			while (pathKeys.length > 1) {
				const subKey = pathKeys.shift();
				if (subKey && current[subKey] !== undefined) {
					current = current[subKey];
				}
			}
			const finalKey = pathKeys.shift();
			if (finalKey) {
				current[finalKey] = value;
			}
		}
	}
}

const exampleSettingsPath = path.join(__dirname, "example.settings.yaml");
const settingsPath = path.join(__dirname, "settings.yaml");

const data = loadYaml(exampleSettingsPath);

const replacements = {
	"telegram.token": "TELEGRAM_BOT_TOKEN",
	"discord.token": "DISCORD_BOT_TOKEN",
	"bridges.0.telegram.chatId": "TELEGRAM_CHAT_ID",
	"bridges.0.discord.channelId": "DISCORD_CHANNEL_ID"
};

replaceValues(data, replacements);

saveYaml(settingsPath, data);

console.log("Settings file prepared successfully.");
