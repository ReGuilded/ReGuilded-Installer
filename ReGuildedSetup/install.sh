#!/bin/sh

#  install.sh
#  ReGuildedSetup
#
#  Created by IT on 17/08/21.
#
# This installer is only for macOS so don't start linuxing me all right?
#

echo "Checking for homebrew installation"

if ! type brew > /dev/null;
then
echo "Installing Homebrew..."
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi


echo "Checking for node.js and git"
if brew ls --versions node && brew ls --versions git> /dev/null;
then
echo "Not installing node.js and git"
else
echo "Installing Dependencies"
brew install node
brew install git
fi


echo "Installing Guilded"

mkdir ~/ReGuildedFiles
cd ~/ReGuildedFiles

echo "Downloading from Github"
git clone https://github.com/ReGuilded/ReGuilded

echo "Installed files"

echo "Installing modules"
cd ReGuilded
npm install


echo "Installed modules, Injecting"

npm run inject

sleep 10
exit









