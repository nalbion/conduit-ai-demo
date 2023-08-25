import { CommonModule } from '@angular/common';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { RosterService } from './services/roster.service';
import { UserStatistics } from '../../../core/api-types/src';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'cdt-roster',
  templateUrl: './roster.component.html',
  // styleUrls: ['./roster.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ]
})
export class RosterComponent implements OnInit {
  users: UserStatistics[] = [];

  constructor(private rosterService: RosterService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.rosterService.getUserStatistics().subscribe(users => {
      this.users = users.sort((a, b) =>
        b.totalLikes - a.totalLikes
      );

      this.cd.detectChanges();
    });
  }
}
