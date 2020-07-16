import fs from 'fs';
import mv from 'move-file';
import path from 'path';
import { from } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';

const commandSplitUnits = (source: string, destination: string) => {
  if (!source || !source?.length) {
    console.error('No source folder given');
    return;
  }
  if (source.split(path.sep).pop()!.toLowerCase() !== 'units') {
    console.error('Please select a units folder!');
    return;
  }
  if (!destination?.length) {
    console.error('Destination not set!');
    return;
  }
  console.log(`Start splitting units in ${source}`);
  const walk = (
    dir: string,
    done: (err: Error | null, results?: string[]) => void
  ) => {
    var results: string[] = [];
    fs.readdir(dir, (err, list) => {
      if (err) {
        return done(err);
      }
      var pending = list.length;
      if (!pending) {
        return done(null, results);
      }
      list.forEach((file) => {
        file = path.resolve(dir, file);
        fs.stat(file, (_err, stat) => {
          if (stat && stat.isDirectory()) {
            walk(file, (_err, res) => {
              results = results.concat(res!);
              if (!--pending) done(null, results);
            });
          } else {
            results.push(file);
            if (!--pending) done(null, results);
          }
        });
      });
    });
  };
  walk(source, (err, results) => {
    if (err || !results) {
      console.error(err);
    }
    from(results!)
      .pipe(
        filter((n) => {
          const split = path.normalize(n).split(path.sep);
          const slice = split.slice(split.length - 3);
          const fileName = slice[slice.length - 1];
          if (
            !fileName.toLowerCase().endsWith('_script.lua') &&
            !fileName.toLowerCase().endsWith('_unit.bp') &&
            split[split.length - 3].toLowerCase() === 'units'
          ) {
            return true;
          }
          return false;
        }),
        mergeMap((n) => {
          const split = path.normalize(n).split(path.sep);
          const slice = split.slice(split.length - 3);

          const fileDestination = path.join(destination, slice.join(path.sep));
          console.log(
            `Moving file: ${slice.join(path.sep)} to "${fileDestination}"`
          );
          return from(mv(n, fileDestination));
        })
      )
      .subscribe(
        () => {},
        (e) => {
          console.error(e);
        },
        () => {
          console.log('Jobs done!');
        }
      );
  });
  // walk(`${BASE_URI}/LOUD`, (err, results) => {
  //   if (err || !results) {
  //     logEntry(
  //       `updaterCreateLocalCRC$:walk::${err} / ${results}`,
  //       "error",
  //       logConfig.channels
  //     );
  //     rej(err);
  //     return;
  //   }
  //   const crcs = results
  //     .filter((res) => {
  //       return !excludeCRC.find((ex) => res.toLowerCase().includes(ex));
  //     })
  //     .map((result) => {
  //       const buffer = fs.readFileSync(result);
  //       const fileURI = path
  //         .normalize(result)
  //         .replace(path.normalize(`${BASE_URI}/LOUD/`), "");
  //       const shacrypto = crypto.createHash("sha1");
  //       shacrypto.update(buffer);
  //       const sha1 = shacrypto.digest("hex").toUpperCase();
  //       shacrypto.destroy();
  //       return `${fileURI},0x${sha1},${buffer.byteLength}`;
  //     });
  //   crcs.push(
  //     "bin\\LoudDataPath.lua,0xE0A4D83007A0222CD1EDBD77E6CFA81BB2F32252,1499"
  //   );
  //   crcs.sort();
  //   fs.writeFile(`${BASE_URI}/SCFA_FileInfo.txt`, crcs.join("\r\n"), (err) => {
  //     if (err) {
  //       logEntry(
  //         `Could not generate CRC file ${err}`,
  //         "error",
  //         logConfig.channels
  //       );
  //       rej(err);
  //       return;
  //     }
  //     logEntry(
  //       "updaterCreateLocalCRC$:: Finished the CRC Process. The file is located at ./SCFA_FileInfo.txt",
  //       "log",
  //       logConfig.channels
  //     );
  //     res();
  //   });
  // });
};

export default commandSplitUnits;
