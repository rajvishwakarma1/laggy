# VHS Demo Recording
# 
# VHS requires a new terminal session after install.
# 
# To record the demo GIF:
# 1. Open a NEW terminal window (important!)
# 2. cd to the laggy directory
# 3. Run: vhs scripts/demo.tape
# 
# The GIF will be saved to scripts/demo.gif

Output scripts/demo.gif

Set FontSize 16
Set Width 700
Set Height 450
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 40ms

# Start
Type "# laggy - Network chaos simulator"
Enter
Sleep 1s

# Show help preview
Type "laggy --list-presets"
Enter
Sleep 3s

# Show a simple example
Type "laggy --preset slow-3g npm test"
Enter
Sleep 2s

# Outro
Type "# Simulate bad networks. Break your app before users do."
Enter
Sleep 2s
