Option Explicit
Dim shell, fso, appDir, attempt, ready, request
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = appDir

ready = IsServerReady()
If Not ready Then
  shell.Run "cmd.exe /d /s /c ""set WEATHERGPT_PORT=8778&&python app.py""", 0, False
  For attempt = 1 To 30
    WScript.Sleep 500
    If IsServerReady() Then
      ready = True
      Exit For
    End If
  Next
End If

If ready Then
  shell.Run "http://127.0.0.1:8778/", 1, False
Else
  MsgBox "WeatherGPT could not start. Check that Python is installed, then try again.", vbExclamation, "WeatherGPT"
End If

Function IsServerReady()
  On Error Resume Next
  Set request = CreateObject("WinHttp.WinHttpRequest.5.1")
  request.SetTimeouts 400, 400, 400, 700
  request.Open "GET", "http://127.0.0.1:8778/", False
  request.Send
  IsServerReady = (Err.Number = 0 And request.Status = 200)
  Err.Clear
  Set request = Nothing
  On Error GoTo 0
End Function