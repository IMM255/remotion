Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
electronExe = dir & "\node_modules\electron\dist\electron.exe"

If fso.FileExists(electronExe) Then
  shell.CurrentDirectory = dir
  shell.Run """" & electronExe & """ .", 0, False
Else
  MsgBox "Electron belum terpasang. Jalankan 'npm install' di folder " & dir, vbExclamation, "Remotion Motion Studio"
End If
