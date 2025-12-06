const fs = require('fs-extra');
const path = require('path');
const logs = require('../../utility/logs');

async function loadCommands(client, commandsPath) {
  client.commands.clear();
  
  try {
    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    
    for (const file of files) {
      try {
        const filePath = path.join(commandsPath, file);
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);
        
        if (command.config && command.config.name) {
          client.commands.set(command.config.name.toLowerCase(), command);
          logs.success('COMMAND', `Loaded: ${command.config.name}`);
        }
      } catch (error) {
        logs.error('COMMAND', `Failed to load ${file}:`, error.message);
      }
    }
    
    logs.info('REFRESH', `Loaded ${client.commands.size} commands`);
  } catch (error) {
    logs.error('REFRESH', 'Failed to load commands:', error.message);
  }
}

async function loadEvents(client, eventsPath) {
  client.events.clear();
  
  try {
    const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    
    for (const file of files) {
      try {
        const filePath = path.join(eventsPath, file);
        delete require.cache[require.resolve(filePath)];
        const event = require(filePath);
        
        if (event.config && event.config.name) {
          client.events.set(event.config.name.toLowerCase(), event);
          logs.success('EVENT', `Loaded: ${event.config.name}`);
        }
      } catch (error) {
        logs.error('EVENT', `Failed to load ${file}:`, error.message);
      }
    }
    
    logs.info('REFRESH', `Loaded ${client.events.size} events`);
  } catch (error) {
    logs.error('REFRESH', 'Failed to load events:', error.message);
  }
}

async function reloadCommand(client, commandsPath, commandName) {
  try {
    const filePath = path.join(commandsPath, `${commandName}.js`);
    
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'Command file not found' };
    }
    
    delete require.cache[require.resolve(filePath)];
    const command = require(filePath);
    
    if (command.config && command.config.name) {
      client.commands.set(command.config.name.toLowerCase(), command);
      logs.success('RELOAD', `Reloaded: ${command.config.name}`);
      return { success: true };
    }
    
    return { success: false, error: 'Invalid command structure' };
  } catch (error) {
    logs.error('RELOAD', `Failed to reload ${commandName}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  loadCommands,
  loadEvents,
  reloadCommand
};
