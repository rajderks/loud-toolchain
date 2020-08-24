import path from 'path';
import { stat, readdir, readdirSync, fstat, readFileSync } from 'fs';

type SourceType = 'proj';

// G:\Git\Git-LOUD\gamedata\TotalMayhem\mods\TotalMayhem

const commandUnusedAssets = (source: string, type: SourceType) => {
  if (type === 'proj') {
    readdir(path.join(source, 'projectiles'), (errDirs, dirs) => {
      if (errDirs) {
        throw errDirs;
      }
      const projBlueprints: string[] = [];
      for (let dir of dirs) {
        try {
          const files = readdirSync(path.join(source, 'projectiles', dir));
          const bp = files.find((file) => path.extname(file) === '.bp');
          if (!bp) {
            throw new Error(files.toString());
          }
          projBlueprints.push(bp);
        } catch (err) {
          throw err;
        }
      }
      console.warn('projectiles \r\n', JSON.stringify(projBlueprints, null, 2));

      let projBlueprintsSlice = projBlueprints.slice();
      readdir(path.join(source, 'units'), (errUnitDirs, unitDirs) => {
        if (errUnitDirs) {
          throw errUnitDirs;
        }
        const unitBlueprints: string[] = [];
        for (let dir of unitDirs) {
          try {
            const files = readdirSync(path.join(source, 'units', dir));
            const bp = files.find((file) => path.extname(file) === '.bp');
            const script = files.find((file) =>
              file.toLowerCase().includes('script.lua')
            );
            if (!bp || !script) {
              console.error(
                `${bp} || ${script} not found ${JSON.stringify(files, null, 2)}`
              );
            }
            if (bp) {
              unitBlueprints.push(bp);
              const fileContent = readFileSync(
                path.join(source, 'units', dir, bp)
              ).toString();
              for (let proj of projBlueprints) {
                if (fileContent.toLowerCase().includes(proj.toLowerCase())) {
                  console.warn('included?', proj);
                  const projIdx = projBlueprintsSlice.findIndex(
                    (x) => x.toLowerCase() === proj.toLowerCase()
                  );
                  if (projIdx > -1) {
                    projBlueprintsSlice.splice(projIdx, 1);
                  }
                }
              }
            }
            if (script) {
              unitBlueprints.push(script);
              const fileContent = readFileSync(
                path.join(source, 'units', dir, script)
              ).toString();
              for (let proj in projBlueprints) {
                if (fileContent.includes(proj)) {
                  const projIdx = projBlueprintsSlice.findIndex(
                    (x) => x.toLowerCase() === proj.toLowerCase()
                  );
                  if (projIdx > -1) {
                    projBlueprintsSlice.splice(projIdx, 1);
                  }
                }
              }
            }
          } catch (err) {
            throw err;
          }
        }
        console.warn('units \r\n', JSON.stringify(unitBlueprints, null, 2));
        readdir(path.join(source, 'hook', 'units'), (errUnitDirs, unitDirs) => {
          if (errUnitDirs) {
            throw errUnitDirs;
          }
          const unitBlueprints: string[] = [];
          for (let dir of unitDirs) {
            try {
              const files = readdirSync(
                path.join(source, 'hook', 'units', dir)
              );
              const bp = files.find((file) => path.extname(file) === '.bp');
              const script = files.find((file) =>
                file.toLowerCase().includes('script.lua')
              );
              if (!bp || !script) {
                console.error(
                  `${bp} || ${script} not found ${JSON.stringify(
                    files,
                    null,
                    2
                  )}`
                );
              }
              if (bp) {
                unitBlueprints.push(bp);
                const fileContent = readFileSync(
                  path.join(source, 'hook', 'units', dir, bp)
                ).toString();
                for (let proj of projBlueprints) {
                  if (fileContent.toLowerCase().includes(proj.toLowerCase())) {
                    console.warn('included?', proj);
                    const projIdx = projBlueprintsSlice.findIndex(
                      (x) => x.toLowerCase() === proj.toLowerCase()
                    );
                    if (projIdx > -1) {
                      projBlueprintsSlice.splice(projIdx, 1);
                    }
                  }
                }
              }
              if (script) {
                unitBlueprints.push(script);
                const fileContent = readFileSync(
                  path.join(source, 'hook', 'units', dir, script)
                ).toString();
                for (let proj in projBlueprints) {
                  if (fileContent.includes(proj)) {
                    const projIdx = projBlueprintsSlice.findIndex(
                      (x) => x.toLowerCase() === proj.toLowerCase()
                    );
                    if (projIdx > -1) {
                      projBlueprintsSlice.splice(projIdx, 1);
                    }
                  }
                }
              }
            } catch (err) {
              throw err;
            }
          }
          console.warn(
            'units hooks \r\n',
            JSON.stringify(unitBlueprints, null, 2)
          );
          console.warn(
            'unused blueprints \r\n',
            JSON.stringify(projBlueprintsSlice, null, 2)
          );
        });
      });
    });
  }
};

export default commandUnusedAssets;
