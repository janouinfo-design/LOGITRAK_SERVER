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

REM récupération de NodeJS
for /f "delims=" %%I in ('where node') do set "node_path=%%I"

set servicename=OMNI %description% ALM %version%
echo path : %CD%
echo name : %servicename%
echo node : %node_path%

.\nssm\nssm.exe install "%servicename%" confirm
.\nssm\nssm.exe set "%servicename%" Application "%node_path%"
.\nssm\nssm.exe set "%servicename%" AppDirectory "%CD%"
.\nssm\nssm.exe set "%servicename%" AppParameters " """%CD%\app.js""""


pause