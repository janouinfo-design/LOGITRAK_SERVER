@echo off
@echo off & setlocal

set "jsonfile=.\package.json"

REM récupération de la version
set "psCmd="add-type -As System.Web.Extensions;^
$JSON = new-object Web.Script.Serialization.JavaScriptSerializer;^
$JSON.DeserializeObject($input).version""
for /f %%I in ('^<"%jsonfile%" powershell -noprofile %psCmd%') do set "version=%%I"

REM récupération du nom du service
set "psCmd="add-type -As System.Web.Extensions;^
$JSON = new-object Web.Script.Serialization.JavaScriptSerializer;^
$JSON.DeserializeObject($input).description""
for /f %%I in ('^<"%jsonfile%" powershell -noprofile %psCmd%') do set "description=%%I"

set servicename=OMNI %description% Dev %version%
echo path : %CD%
echo name : %servicename%

.\nssm\nssm.exe stop "%servicename%"
.\nssm\nssm.exe remove "%servicename%" confirm
pause