import {Component, OnInit, ElementRef, Inject } from 'angular2/core';
import {SubularService} from './../../services/subular-service';
import {SettingsService} from './../../services/settings-service';
import {HTTP_PROVIDERS}    from 'angular2/http';
import {IAlbum} from './../../models/album';
import {ISong} from '../../models/song';
import 'rxjs/add/operator/map';
import {PlayerService} from '../../services/player-service';

declare var ColorThief: any;

@Component({
	selector: 'album-card',
	templateUrl: '/app/shared/directives/album-card/album-card.html',
	inputs: ['id', 'album', 'playerService', 'click'],
	styles: [`
	.card{

	}
	i.fa {
		position: absolute;
		font-size: 55px;
		bottom: 0;
		right: -4;
		color: #fff;
		margin-right:1%;
		/*text-shadow: black 0.1em 0.1em 0.2em*/
	}
	.album-card
	{
		display:block;
		background-color: #fff;
		width: 90%;
		margin: 0 auto;
		padding-top:1%;
	}
	img {
		display:block;
		width:98%;
		min-height:162px;
		margin:0 auto 0;
	}
	.album-card-footer{
		margin: 0 auto;
		width: 90%;
		height: 35px;
		background-color: #fff;
		margin-bottom: 10px;
		padding:2px 33px 0 5px;
		font-size:1.7vh;
		line-height:14px;
		border-bottom-left-radius: 5px;
		border-bottom-right-radius: 5px;
		font-weight:700;
		color:#101010;
	}
	i.fa:hover{
		color:#9d9d9d !important;
	}
`]
})
export class AlbumCard implements OnInit {
	public album: IAlbum;
	public id: number;
	public playerService: PlayerService;

	constructor(private _dataService: SubularService, private _elementRef: ElementRef, @Inject(PlayerService) playerService: PlayerService) {
		this.playerService = playerService;
	}
	imgUrl(id: number): string {
		let url = this._dataService.getCoverUrl(id);
		return url;
	}

	ngOnInit() {
		let el = this._elementRef.nativeElement;
		let img = el.getElementsByClassName('artist-album')[0];
		let button = el.getElementsByClassName('play-button')[0];
		let footer = el.getElementsByClassName('album-card-footer')[0];
		let colorThief = new ColorThief()
		let alt = document.getElementById('album-list-artist');

		if (img != null) {
			img.crossOrigin = 'Anonymous';
			img.addEventListener("load", () => {
				let palettes: any[] = colorThief.getPalette(img, 8);
				alt.setAttribute('style', 'color:#fefefe;border-bottom:2px ' + this.getRGBString(palettes[6]) + 'solid;');
				if (document.body.getAttribute('style') === '') {
					document.body.setAttribute('style', `
						background: -webkit-linear-gradient(` + this.getBrightBGColor(palettes) + `, #101010, #080808);
						background: -o-linear-gradient(` + this.getBrightBGColor(palettes) + `, #101010, #080808);
						background: linear-gradient(` + this.getBrightBGColor(palettes) + `, #101010, #080808);
						`);
				}
				button.setAttribute('style', 'color:' + this.getRGBString(palettes[4]));
			});
		}
	}
	getRGBString(palette: any[]): string {
		return 'rgb(' + palette[0] + ',' + palette[1] + ',' + palette[2] + ')';
	}

	getBrightBGColor(palettes: any[], tolerance?: number): string {
		tolerance = tolerance == null ? 199 : tolerance;

		let brightPallet = palettes[0];
		palettes.forEach((palette: any) => {
			if ((palette[0] > tolerance || palette[1] > tolerance || palette[2] > tolerance) && (palette[0] < (tolerance - (tolerance / 3)) || palette[1] < (tolerance - (tolerance / 3)) || palette[2] < (tolerance - (tolerance / 3)))) {
				brightPallet = palette;
			}
		});

		if (brightPallet[0] < tolerance && brightPallet[1] < tolerance && brightPallet[2] < tolerance) {
			return this.getBrightBGColor(palettes, tolerance - 15);
		} else {
			return this.getRGBString(brightPallet);
		}
	}

	playAlbum(id: number): void {
		let songsList: ISong[] = this._dataService.getSongsByArtistIdAlbumId(this.album.parent, id);
		this.playerService.clearSongs();
		this.playerService.addSongs(songsList);
	}
}
