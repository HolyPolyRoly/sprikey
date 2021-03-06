import { GUILD } from "@constants/Guild";
import { EMOTES } from "@constants/Icons";
import { ROLES } from "@constants/Roles";
import { SprikeyClient } from "@structs/SprikeyClient";
import SprikeyListener from "@structs/SprikeyListener";
import { Guild, Message, Role } from "discord.js";

export default class ReadyListener extends SprikeyListener {

  constructor() {
    super("ready", {
      emitter: "client",
      event: "ready",
      type: "once"
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async exec(): Promise<void> {

    await ready(this.client)
      .catch(async err => {
        console.error(err);

        await this.client.user?.setPresence({
          status: "dnd",
          activity: {
            name: "out for errors",
            type: "WATCHING"
          }
        });
      });

  }

}

async function ready(client: SprikeyClient): Promise<void> {
  console.timeEnd("Bot Login");
  console.time("Initiation");
  console.log("Bot Connected!");

  await loadAndCacheStaffRoles(client);

  // cache.bot_last_active_interval = setInterval(() => {
  //   cache.botLastActive = Date.now();
  // }, 15000);

  // cache.subcommands.toArray.entries().map(([ subcommandName, {
  //   inherits,
  //   ...subcommandData
  // } ]) => {
  //   const subbingCommand = dataPack.commands.get(inherits);
  //   const subCommand = subbingCommand.createSub(subcommandData);

  //   dataPack.commands.set(subcommandName, subCommand);
  // });

  await enableBot(client);
  await updateRestartMessage(client);

  console.log("Bot is now listening to events!");
  console.timeEnd("Initiation");
}

async function loadAndCacheStaffRoles(client: SprikeyClient): Promise<void> {
  const MAIN_GUILD = client.guilds.cache.get(GUILD.MAIN);
  const TEST_GUILD = client.guilds.cache.get(GUILD.TEST) as Guild;

  const BLANK_ROLE = new Role(client, {}, TEST_GUILD);

  const [
    mainAdmin, mainMod,
    testAdmin, testMod
  ] = await Promise.all([
    MAIN_GUILD ? MAIN_GUILD.roles.fetch(ROLES.MAIN.STAFF.ADMIN) : BLANK_ROLE,
    MAIN_GUILD ? MAIN_GUILD.roles.fetch(ROLES.MAIN.STAFF.MOD) : BLANK_ROLE,
    TEST_GUILD.roles.fetch(ROLES.TEST.STAFF.ADMIN),
    TEST_GUILD.roles.fetch(ROLES.TEST.STAFF.MOD)
  ]);

  client.cache.roles = { mainAdmin, mainMod, testAdmin, testMod };
}


async function enableBot(client: SprikeyClient): Promise<void> {
  await client.user?.setPresence({
    status: "online",
    activity: {
      name: "with butterflies",
      type: "PLAYING"
    }
  });
}

async function updateRestartMessage({ botOptions, channels }: SprikeyClient) {
  const restartMessageData = await botOptions.get("restartMessage");
  if (!restartMessageData) return;

  const { channelID, messageID } = restartMessageData;
  const sourceChannel = channels.cache.get(channelID) as Message["channel"] | undefined;
  const restartMessage = await sourceChannel?.messages.fetch(messageID);

  if (!restartMessage) return;

  await restartMessage.reactions.removeAll();
  await restartMessage.react(EMOTES.check);

  await botOptions.update("restartMessage", { channelID: "", messageID: "" });
}