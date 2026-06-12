Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
root = fso.GetParentFolderName(WScript.ScriptFullName)
previewPath = root & "\dist\SelfImprovementLabs-preview.exe"
exePath = root & "\dist\SelfImprovementLabs.exe"
If fso.FileExists(exePath) Then
  shell.Run """" & exePath & """", 1, False
Else
  If fso.FileExists(previewPath) Then
    shell.Run """" & previewPath & """", 1, False
  Else
    shell.Run """" & root & "\Build-Desktop.bat" & """", 1, True
    If fso.FileExists(exePath) Then
      shell.Run """" & exePath & """", 1, False
    End If
  End If
End If
