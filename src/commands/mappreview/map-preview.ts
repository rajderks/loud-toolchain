import fs from 'fs';
import path from 'path';
import parseLUA from '../parseLUA';
import Jimp from 'jimp';
import { stringify } from 'querystring';

interface MapMarker {
  type: 'Mass' | 'Hydrocarbon' | 'BlankMarker';
  position: string;
}

const IMAGE_SIZE = 1024.0;
const MARKER_SIZE = 20.0;
const MARKER_RATIO = MARKER_SIZE / IMAGE_SIZE;
const IMAGE_MASS = path.join(__dirname, 'mass.png');
const IMAGE_HYDRO = path.join(__dirname, './hydro.png');
const IMAGE_ARMY = path.join(__dirname, './army.png');

const commandMapPreview = async (
  source: string,
  destination: string = 'marked_preview.jpg'
) => {
  if (!source || !source?.length) {
    throw new Error('No source folder given');
  }
  // console.warn(`Generating map preview for ${path.basename(source)}`);
  // const filebuffer = fs.readFileSync(source);

  // const ddsSize = filebuffer.readIntLE(16 + 6, 4);
  // console.log(
  //   'floep',
  //   filebuffer.byteLength,
  //   filebuffer.readFloatLE(16),
  //   ddsSize,
  //   filebuffer.slice(16 + 6 + 12, 300).toString()
  // );
  // const ddsData = filebuffer.slice(16 + 6 + 12, 16 + 6 + 12 + ddsSize);
  // const _dds = parse(ddsData);
  // console.log(_dds);
  // const scenario = fs.readFileSync(
  //   './Drakes_Ravine_Flat.v0001/Drakes_Ravine_Flat_save.lua'
  // );

  const dirStat = fs.statSync(source);
  const dir = dirStat.isDirectory() ? source : path.dirname(source);
  const paths = {
    save: '',
    preview: '',
    scenario: '',
  };
  const dirContent = fs.readdirSync(dir);

  dirContent.forEach((file) => {
    if (file.toLowerCase().endsWith('_save.lua')) {
      paths.save = path.join(dir, file);
    }
    if (file.toLowerCase().endsWith('preview.jpg')) {
      paths.preview = path.join(dir, file);
    }
    if (file.toLowerCase().endsWith('scenario.lua')) {
      paths.scenario = path.join(dir, file);
    }
  });
  if (!paths.preview.length) {
    throw new Error('no preview.jpg found: ' + JSON.stringify(dirContent));
  }
  if (!paths.save.length) {
    throw new Error('no _save.lua found: ' + JSON.stringify(dirContent));
  }
  if (!paths.scenario.length) {
    throw new Error('no _scenario.lua found: ' + JSON.stringify(dirContent));
  }
  const [width, height]: number[] = fs
    .readFileSync(paths.scenario)
    .toString()
    .match(/size.*\{(.*)\}/)?.[1]
    .split(',')
    .map((x) => Number.parseInt(x.trim(), 10))!;
  if (!width || !height) {
    throw new Error(
      `Could not extract mapSize from scenario.lua: [${width}, ${height}]`
    );
  }

  const saveJSON = JSON.parse(
    parseLUA(paths.save)!
    // parseLUA(paths.save, path.join(__dirname, 'floep.json'))!
  );

  //

  const markers: Record<string, any> =
    saveJSON.MasterChain['_MASTERCHAIN_'].Markers;
  const markersFiltered = Object.entries(markers).reduce(
    (
      acc: {
        mass: MapMarker[];
        hydro: MapMarker[];
        army: MapMarker[];
      },
      marker: [string, MapMarker]
    ) => {
      const [key, val] = marker;
      if (val.type.toLowerCase() === 'mass') {
        acc.mass.push(val);
      } else if (val.type.toLowerCase() === 'hydrocarbon') {
        acc.hydro.push(val);
      } else if (
        val.type.toLowerCase() === 'blankmarker' &&
        key.toLowerCase().startsWith('army')
      ) {
        acc.army.push(val);
      }
      return acc;
    },
    { mass: [], hydro: [], army: [] }
  );

  const massJimp = await Jimp.read(IMAGE_MASS);
  const hydroJimp = await Jimp.read(IMAGE_HYDRO);
  const armyJimp = await Jimp.read(IMAGE_ARMY).then((image) => {
    image.scale(1.5);
    return image;
  });

  Jimp.read(paths.preview).then((image: Jimp) => {
    image.resize(
      (IMAGE_SIZE / width) * width,
      (IMAGE_SIZE / height) * height,
      (error) => {
        if (error) {
          throw error;
        }
        markersFiltered.mass.forEach((m) => {
          const coords = luaPositionToCoords(m.position, width, height);
          composeImage(image, massJimp, coords);
        });
        markersFiltered.hydro.forEach((m) => {
          const coords = luaPositionToCoords(m.position, width, height);
          composeImage(image, hydroJimp, coords);
        });
        markersFiltered.army.forEach((m) => {
          const coords = luaPositionToCoords(m.position, width, height);
          composeImage(image, armyJimp, coords);
        });
        try {
          fs.unlinkSync(path.join('./', dir, destination));
        } catch (e) {
          // console.error(e);
        }
        image.write(path.join(dir, destination));
        console.log('Jobs done!');
      }
    );
  });

  console.warn(Object.values(markersFiltered).map((x) => x.length));
};

const luaPositionToCoords = (
  position: string,
  width: number,
  height: number
) => {
  const coords = position.split(',');
  return {
    x: Number.parseFloat(coords[0]),
    y: Number.parseFloat(coords[2]),
    xPerc: Number.parseFloat(coords[0]) / width,
    yPerc: Number.parseFloat(coords[2]) / height,
  };
};

const composeImage = (
  src: Jimp,
  dest: Jimp,
  coords: { x: number; y: number; xPerc: number; yPerc: number }
) =>
  src.composite(
    dest,
    coords.xPerc * IMAGE_SIZE - dest.getWidth() / 2,
    coords.yPerc * IMAGE_SIZE - dest.getHeight() / 2
  );

export default commandMapPreview;

// (?=\['mass\s\d+).*\['position'\].*(VECTOR3\(.*\)),
