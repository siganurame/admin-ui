// generated on 2015-10-06 using generator-gulp-webapp 1.0.3
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
	return gulp.src('app/assets/css/*.less')
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.less({
			paths: ['.']
		}))
		.pipe($.autoprefixer({browsers: ['last 1 version']}))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('.tmp/assets/css'))
		.pipe(reload({stream: true}));
});

function lint(files, options) {
	return () => {
		return gulp.src(files)
			.pipe(reload({stream: true, once: true}))
			.pipe($.eslint(options))
			.pipe($.eslint.format())
			.pipe($.if(!browserSync.active, $.eslint.failAfterError()));
	};
}
const testLintOptions = {
	env: {
		mocha: true
	}
};

gulp.task('lint', lint('app/assets/js/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['styles', 'html:useref'], () => {
	const assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

	return gulp.src('app/index.html')
		.pipe(assets)
		//.pipe($.if('*.js', $.uglify()))
		//.pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
		.pipe(assets.restore())
		.pipe($.useref())
		.pipe(gulp.dest('dist'));
});

gulp.task('html:useref', () => {
	const assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

	return gulp.src(['app/**/*.html', '!app/index.html', '!app/documentation/**/*.html'])
		.pipe($.useref())
		.pipe(gulp.dest('dist'));
});

gulp.task('images', ['images:bower'], () => {
	return gulp.src('app/assets/img/**/*')
		.pipe($.if($.if.isFile, $.cache($.imagemin({
			progressive: true,
			interlaced: true,
			// don't remove IDs from SVGs, they are often used
			// as hooks for embedding and styling
			svgoPlugins: [{cleanupIDs: false}]
		}))
		.on('error', function (err) {
			console.log(err);
			this.end();
		})))
		.pipe(gulp.dest('dist/assets/img'));
});

gulp.task('images:bower', () => {
	return gulp.src(require('main-bower-files')({
		filter: '**/*.{jpg,png}',
	})).pipe(gulp.dest('dist/assets/img/vendor'));
});

gulp.task('fonts', () => {
	return gulp.src(require('main-bower-files')({
		filter: '**/*.{eot,svg,ttf,woff,woff2}'
	}).concat('app/assets/fonts/**/*'))
		.pipe(gulp.dest('.tmp/assets/fonts'))
		.pipe(gulp.dest('dist/assets/fonts'));
});

gulp.task('extras', ['extras:locales'], () => {
	return gulp.src([
		'app/*.*',
		'!app/*.html'
	], {
		dot: true
	}).pipe(gulp.dest('dist'));
});

gulp.task('extras:locales', () => {
	return gulp.src([
			'bower_components/bootstrap-datepicker/dist/locales/*.js',
			'bower_components/bootstrap3-wysihtml5-bower/dist/locales/*.js',
			'bower_components/fullcalendar/dist/lang/*.js'
		])
		.pipe(gulp.dest('dist/assets/js/locales'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'fonts'], () => {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: ['.tmp', 'app'],
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch([
		'app/*.html',
		'app/pages/**/*.html',
		'app/documentation/*.html',
		'app/assets/js/**/*.js',
		'app/assets/img/**/*',
		'.tmp/assets/fonts/**/*'
	]).on('change', reload);

	gulp.watch('app/assets/css/**/*.less', ['styles']);
	gulp.watch('app/assets/fonts/**/*', ['fonts']);
	gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: ['dist']
		}
	});
});

gulp.task('serve:test', () => {
	browserSync({
		notify: false,
		port: 9000,
		ui: false,
		server: {
			baseDir: 'test',
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch('test/spec/**/*.js').on('change', reload);
	gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
	gulp.src('app/assets/css/*.less')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)+/
		}))
		.pipe(gulp.dest('app/assets/css'));

	gulp.src('app/**/*.html')
		.pipe(wiredep({
			exclude: ['rangy-1.3', 'mocha'],
			ignorePath: /^(\.\.\/)*\.\./
		}))
		.pipe(gulp.dest('app'));
});

gulp.task('build', ['html', 'images', 'fonts', 'extras'], () => {
	return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
	gulp.start('build');
});
