@echo off

REM ## Watch the files for changes
java -classpath lib-carve/js/js.jar;lib-carve/js/compiler.jar org.mozilla.javascript.tools.shell.Main lib-carve/js/build.js -watch %*
REM java -classpath lib-carve/js/js.jar;lib-carve/js/compiler.jar org.mozilla.javascript.tools.shell.Main lib-carve/js/build.js  %*

REM ## Debug the code
REM java -classpath lib-carve/js/js.jar;lib-carve/js/compiler.jar org.mozilla.javascript.tools.debugger.Main lib-carve/js/build.js


REM ### BUILDing

REM ## As part of any build
REM
REM java -classpath lib-carve/js/js.jar;lib-carve/js/compiler.jar org.mozilla.javascript.tools.shell.Main lib-carve/js/build.js

REM	## As part of ANT build
REM 
REM	<path id="compress.classpath">
REM		<pathelement location="${pathToCarve}/lib-carve/js/js.jar" />
REM		<pathelement location="${pathToCarve}/lib-carve/js/compiler.jar" />
REM	</path>
REM
REM <java fork="true" failonerror="true" dir="${pathToCarve}" classname="org.mozilla.javascript.tools.shell.Main">
REM 	<classpath refid="compress.classpath" />
REM 	<arg value="lib-carve/js/build.js">
REM 	</arg>
REM </java>

REM	## As part of MSbuild
REM
REM <PropertyGroup>
REM 	<!-- Path to carve (children folders are 'themes' and 'lib-carve' -->
REM 	<CarveWorkingDir>.\carve</CarveWorkingDir>
REM 
REM 	<!-- Update path to Java -->
REM 	<JavaPath>"$(JAVA_HOME)\bin\java"</JavaPath>
REM 
REM 	<CarveBuildArgs>$(JavaPath) -classpath lib-carve/js/js.jar;lib-carve/js/compiler.jar</CarveBuildArgs>         
REM 	<CarveBuildArgs>$(CarveBuildArgs) org.mozilla.javascript.tools.shell.Main lib-carve/js/build.js</CarveBuildArgs>          
REM </PropertyGroup>
REM 
REM <!-- Run the Compression Script : themes/%theme-name%.js/live/* -->
REM <Exec ContinueOnError="true" WorkingDirectory="$(CarveWorkingDir)" 
REM 	Command="$(CarveBuildArgs)" />
