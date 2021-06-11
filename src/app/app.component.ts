import {
  ChangeDetectorRef,
  Component,
  HostListener,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { from } from 'rxjs';
import WebAudio from 'wavesurfer.js/src/webaudio.js';
import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import MarkersPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.markers.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.spectrogram.js';
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
regions = [
    {
      color: this.randomColor(0.5),
      active: false,
      start: 1.1,
      end: 1.8,
      data: { note: 'hi' },
      attributes: { label: 'abc', highlight: true, active: false }
    },
    {
      color: this.randomColor(0.5),
      active: false,
      start: 2.7,
      end: 4.1,
      data: { note: 'hi' },
      attributes: { active: false }
    },
    {
      color: this.randomColor(0.5),
      active: false,
      start: 6,
      end: 8.2,
      data: { note: 'hi' },
      attributes: { active: false }
    },
    {
      color: this.randomColor(0.5),
      active: false,
      start: 8.6,
      end: 12.2,
      data: { note: 'hi' },
      attributes: { active: false }
    },
    {
      color: this.randomColor(0.5),
      active: false,
      start: 12.8,
      end: 16.2,
      data: { note: 'hi' },
      attributes: { active: false }
    },
    {
      color: this.randomColor(0.5),
      active: false,
      start: '17.8',
      end: '18.6',
      data: { note: 'hi' },
      attributes: { active: false }
    }
  ];
  markersOptions = {
    markers: [
      {
        time: 5.5,
        label: 'V1',
        color: '#ff990a'
      },
      {
        time: 10,
        label: 'V2',
        color: '#00ffcc',
        position: 'top'
      }
    ]
  };





  wave: WaveSurfer = null;
  isMuted = false;
  eqEnabled = false;
  progress = '0:00';
  volume = 1;
  zoom = 1;
  url =
    'https://ia800508.us.archive.org/15/items/LoveThemeFromTheGodfather/02LoveThemeFromTheGodfather.mp3';
  randomColorOption = {
    color: this.randomColor(0.1)
  };
  constructor(private cdr: ChangeDetectorRef) {

  


  }

  ngAfterViewInit() {
    if (!this.wave) {
      this.generateWaveform();
      this.wave.load(this.url);
      this.volume = this.wave.getVolume();
    }
  }

  generateWaveform(): void {
    this.wave = WaveSurfer.create({
      container: '#waveform',
      plugins: [
        TimelinePlugin.create({
          container: '#wave-timeline'
        }),
        RegionsPlugin.create({
          // plugin options ...
        }),
        MarkersPlugin.create(this.markersOptions),
        SpectrogramPlugin.create({
          container: '#wave-spectrogram'
        })
      ]
    });

    this.wave.on('ready', () =>
      this.wave.enableDragSelection({
    color: this.randomColor(0.1)
  })
    );
    this.regions.forEach(r => this.wave.addRegion(r));
    this.wave.on('region-in', r => {
      r.attributes.active = true;
    });
    this.wave.on('region-out', r => {
      r.attributes.active = false;
    });

    this.wave.on('audioprocess', e => {
      this.progress = this.fmtMSS(Math.floor(e));
      this.cdr.detectChanges();
    });


    // this.wave.on('region-click', function(region, e) {
    //     e.stopPropagation();
    //     // Play on click, loop on shift click
    //     e.shiftKey ? region.playLoop() : region.play();
    // });
    this.wave.on(
      'region-click',
      r => (r.attributes.active = !r.attributes.active)
    );
    this.wave.on('region-created', r => {
      r.attributes.active = true;
      this.regions.push(r);
    });
    // // this.wave.on('region-updated', this.saveRegions);
    // // this.wave.on('region-removed', this.saveRegions);
    // // this.wave.on('region-in', this.showNote);

    // this.wave.on('region-play', function(region) {
    //     region.once('out', function() {
    //         this.wave.play(region.start);
    //         this.wave.pause();
    //     });
    // });
  }

  /**
   * Save annotations to localStorage.
   */
  saveNote(region, note) {
    region.data.note = note.value;
  }
  /**
   * Random RGBA color.
   */
  randomColor(alpha) {
    return (
      'rgba(' +
      [
        ~~(Math.random() * 255),
        ~~(Math.random() * 255),
        ~~(Math.random() * 255),
        alpha || 1
      ] +
      ')'
    );
  }

  private fmtMSS(s) {
    return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
  }

  @HostListener('document:keyup', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    console.log(event);
    if (event.code === 'Space' && this.wave.isPlaying()) {
      this.wave.pause();
      return;
    }
    if (event.code === 'Space' && !this.wave.isPlaying()) {
      this.wave.play(this.wave.getCurrentTime());
      return;
    }
  }

  mute() {
    this.isMuted = !this.isMuted;
    this.wave.setMute(this.isMuted);
  }

  volumeChange(value: number) {
    this.wave.setVolume(value);
    this.volume = value;
  }
  // eqChange() {
  //   this.eqEnabled = !this.eqEnabled;
  //   const audioContext: AudioContext = this.wave.backend.ac;
  //   let biquadFilter: BiquadFilterNode;
  //   console.log(this.eqEnabled);
  //   if (this.eqEnabled) {
  //     audioContext;
  //     biquadFilter = audioContext.createBiquadFilter();
  //   } else {
  //     biquadFilter.type = 'allpass';
  //   }
  // }
  zoomChange(value) {
    this.wave.zoom(value);
    this.zoom = value;
  }
  ngOnDestroy() {
    if (this.wave) this.wave.destroy();
  }
}
