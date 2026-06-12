Set shell = CreateObject("WScript.Shell")
root = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
shell.Run "cmd /c cd /d """ & root & """ && npm run dev:web", 0, False
WScript.Sleep 1500
shell.Run "http://localhost:3000", 1, False
